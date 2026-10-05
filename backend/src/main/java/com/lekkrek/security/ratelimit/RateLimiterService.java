package com.lekkrek.security.ratelimit;

/**
 * ============================================================================
 * 📁 Fichier : RateLimiterService.java
 * 📝 Description : Service de limitation de débit (Rate Limiting) in-memory.
 * 🔒 Rôle : Protège contre les attaques de force brute et le spam d'API.
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    public enum BucketType {
        LOGIN(5, 60),          // 5 requêtes par minute (protection brute-force login)
        ORDERS(10, 60),        // 10 commandes par minute (protection spam commandes)
        GENERAL(120, 60);      // 120 requêtes par minute (protection globale)

        private final int maxRequests;
        private final long windowSeconds;

        BucketType(int maxRequests, long windowSeconds) {
            this.maxRequests = maxRequests;
            this.windowSeconds = windowSeconds;
        }

        public int getMaxRequests() {
            return maxRequests;
        }

        public long getWindowSeconds() {
            return windowSeconds;
        }
    }

    // Clé : "IP:BUCKET_TYPE" -> File d'attente des timestamps des requêtes
    private final Map<String, Deque<Long>> requestHistory = new ConcurrentHashMap<>();

    /**
     * Vérifie si la requête est autorisée pour l'IP et le type de bucket donné.
     * Utilise un algorithme de fenêtre glissante (sliding window).
     */
    public synchronized boolean tryAcquire(String clientIp, BucketType bucketType) {
        String key = clientIp + ":" + bucketType.name();
        long now = Instant.now().getEpochSecond();
        long windowStart = now - bucketType.getWindowSeconds();

        Deque<Long> timestamps = requestHistory.computeIfAbsent(key, k -> new ArrayDeque<>());

        // Purge des timestamps expirés (en dehors de la fenêtre)
        while (!timestamps.isEmpty() && timestamps.peekFirst() <= windowStart) {
            timestamps.pollFirst();
        }

        // Si le quota est dépassé
        if (timestamps.size() >= bucketType.getMaxRequests()) {
            return false;
        }

        // Enregistrer la nouvelle requête
        timestamps.addLast(now);
        return true;
    }

    /**
     * Nombre de requêtes restantes dans la fenêtre courante.
     */
    public synchronized int getRemainingRequests(String clientIp, BucketType bucketType) {
        String key = clientIp + ":" + bucketType.name();
        long now = Instant.now().getEpochSecond();
        long windowStart = now - bucketType.getWindowSeconds();

        Deque<Long> timestamps = requestHistory.get(key);
        if (timestamps == null) {
            return bucketType.getMaxRequests();
        }

        // Nettoyer les expirés
        while (!timestamps.isEmpty() && timestamps.peekFirst() <= windowStart) {
            timestamps.pollFirst();
        }

        return Math.max(0, bucketType.getMaxRequests() - timestamps.size());
    }

    /**
     * Extrait l'adresse IP réelle du client en prenant en compte les proxys inverses.
     */
    public String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // Le premier IP de la liste est l'adresse IP originale du client
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        return request.getRemoteAddr();
    }
}
