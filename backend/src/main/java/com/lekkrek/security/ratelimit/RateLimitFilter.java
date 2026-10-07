package com.lekkrek.security.ratelimit;

/**
 * ============================================================================
 * 📁 Fichier : RateLimitFilter.java
 * 📝 Description : Filtre HTTP interceptant les requêtes pour appliquer le Rate Limiting.
 * 🔒 Rôle : Bloque les attaques DoS et de force brute avant tout traitement coûteux.
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;

    public RateLimitFilter(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Ne pas filtrer les requêtes OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = rateLimiterService.resolveClientIp(request);

        RateLimiterService.BucketType bucketType = null;
        String errorMessage = "Trop de requêtes. Veuillez patienter avant de réessayer.";

        // 1. Protection Anti-Bruteforce sur le Login (5 tentatives / min)
        if (uri.endsWith("/api/v1/auth/login") && "POST".equalsIgnoreCase(method)) {
            bucketType = RateLimiterService.BucketType.LOGIN;
            errorMessage = "Trop de tentatives de connexion. Veuillez patienter 1 minute avant de réessayer.";
        }
        // 2. Protection Anti-Spam sur la création de commande (10 commandes / min)
        else if (uri.endsWith("/api/v1/public/orders") && "POST".equalsIgnoreCase(method)) {
            bucketType = RateLimiterService.BucketType.ORDERS;
            errorMessage = "Trop de commandes soumises en peu de temps. Veuillez patienter 1 minute.";
        }
        // 3. Protection Anti-Flood sur l'enregistrement d'analytics public (30 req / min)
        else if (uri.endsWith("/api/v1/public/analytics") && "POST".equalsIgnoreCase(method)) {
            bucketType = RateLimiterService.BucketType.ANALYTICS;
            errorMessage = "Trop d'événements analytics envoyés. Veuillez patienter 1 minute.";
        }
        // 4. Protection globale sur les endpoints API (120 req / min)
        else if (uri.contains("/api/v1/")) {
            bucketType = RateLimiterService.BucketType.GENERAL;
        }

        // Si une règle de rate limiting s'applique à cet endpoint
        if (bucketType != null) {
            boolean allowed = rateLimiterService.tryAcquire(clientIp, bucketType);
            int remaining = rateLimiterService.getRemainingRequests(clientIp, bucketType);
            response.setHeader("X-RateLimit-Limit", String.valueOf(bucketType.getMaxRequests()));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

            if (!allowed) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.setHeader("Retry-After", String.valueOf(bucketType.getWindowSeconds()));

                String jsonError = String.format(
                    "{\"timestamp\":\"%s\",\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"%s\"}",
                    LocalDateTime.now(),
                    errorMessage
                );

                response.getWriter().write(jsonError);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
