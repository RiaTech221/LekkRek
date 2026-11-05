package com.lekkrek.config;

/**
 * ============================================================================
 * 📁 Fichier : PaymentConfig.java
 * 📝 Description : Configuration PayTech injectée depuis application.properties ou .env.
 * 🔒 Rôle : Centralise les clés API et URLs PayTech.
 * ============================================================================
 */

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentConfig {

    /** Clé API PayTech (en-tête API_KEY) */
    @Value("${paytech.api-key:}")
    private String apiKey;

    /** Clé secrète PayTech (en-tête API_SECRET) */
    @Value("${paytech.api-secret:}")
    private String apiSecret;

    /** URL d'initiation de paiement PayTech */
    @Value("${paytech.url.request:https://paytech.sn/api/payment/request-payment}")
    private String requestUrl;

    /** Environnement PayTech : "test" ou "live" */
    @Value("${paytech.env:test}")
    private String env;

    /** URL IPN exposée par notre backend (reçoit les notifications PayTech) - Obligatoirement en HTTPS */
    @Value("${paytech.ipn-url:https://lekkrek.com/api/v1/public/payments/ipn}")
    private String ipnUrl;

    /** URL de retour succès après paiement PayTech */
    @Value("${paytech.success-url:http://localhost:5173/?payment=success}")
    private String successUrl;

    /** URL de retour annulation après paiement PayTech */
    @Value("${paytech.cancel-url:http://localhost:5173/?payment=cancel}")
    private String cancelUrl;

    public String getApiKey() { return apiKey; }
    public String getApiSecret() { return apiSecret; }
    public String getRequestUrl() { return requestUrl; }
    public String getEnv() { return env; }
    public String getIpnUrl() { return ipnUrl; }
    public String getSuccessUrl() { return successUrl; }
    public String getCancelUrl() { return cancelUrl; }
}
