package com.lekkrek.security.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimiterService rateLimiterService;
    private RateLimitFilter rateLimitFilter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RateLimiterService();
        rateLimitFilter = new RateLimitFilter(rateLimiterService);
        filterChain = mock(FilterChain.class);
    }

    @Test
    void testLoginRateLimitingBlocksAfterLimitExceeded() throws ServletException, IOException {
        String clientIp = "192.168.1.100";

        // Les 5 premières tentatives de login doivent passer (HTTP 200 par défaut dans le mock chain)
        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/public/auth/login");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitFilter.doFilter(request, response, filterChain);

            assertEquals(HttpStatus.OK.value(), response.getStatus(), "La tentative " + i + " devrait être autorisée");
        }

        // La 6ème tentative doit être rejetée avec HTTP 429 Too Many Requests
        MockHttpServletRequest blockedRequest = new MockHttpServletRequest("POST", "/api/v1/public/auth/login");
        blockedRequest.setRemoteAddr(clientIp);
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();

        rateLimitFilter.doFilter(blockedRequest, blockedResponse, filterChain);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), blockedResponse.getStatus(), "La 6ème tentative doit renvoyer 429");
        verify(filterChain, times(5)).doFilter(any(), any());
    }

    @Test
    void testTrackingRateLimitingBlocksAfterLimitExceeded() throws ServletException, IOException {
        String clientIp = "192.168.1.101";

        // Les 30 premières requêtes de suivi doivent passer
        for (int i = 1; i <= 30; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/public/orders/track/CMD-12345678");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitFilter.doFilter(request, response, filterChain);

            assertEquals(HttpStatus.OK.value(), response.getStatus(), "La requête " + i + " devrait être autorisée");
        }

        // La 31ème requête doit être rejetée avec HTTP 429
        MockHttpServletRequest blockedRequest = new MockHttpServletRequest("GET", "/api/v1/public/orders/track/CMD-12345678");
        blockedRequest.setRemoteAddr(clientIp);
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();

        rateLimitFilter.doFilter(blockedRequest, blockedResponse, filterChain);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), blockedResponse.getStatus(), "La 31ème requête doit renvoyer 429");
    }
}
