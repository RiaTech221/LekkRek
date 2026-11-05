package com.lekkrek.service.impl;

/**
 * ============================================================================
 * 📁 Fichier : PaymentServiceImpl.java
 * 📝 Description : Implémentation du service de paiement PayTech.
 *                 Gère l'initiation de paiement (API PayTech) et les IPN.
 * 🔒 Rôle : Appelle l'API PayTech, crée PaymentTransaction, traite les IPN.
 * 💡 Auteur : LekkRek Backend — Paiement PayTech
 * ============================================================================
 */

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lekkrek.config.PaymentConfig;
import com.lekkrek.dto.payment.PaymentInitiateRequestDTO;
import com.lekkrek.dto.payment.PaymentInitiateResponseDTO;
import com.lekkrek.dto.payment.PaymentTransactionDTO;
import com.lekkrek.entity.Commande;
import com.lekkrek.entity.PaymentTransaction;
import com.lekkrek.repository.CommandeRepository;
import com.lekkrek.repository.PaymentTransactionRepository;
import com.lekkrek.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentConfig paymentConfig;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final CommandeRepository commandeRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PaymentServiceImpl(PaymentConfig paymentConfig,
                              PaymentTransactionRepository paymentTransactionRepository,
                              CommandeRepository commandeRepository) {
        this.paymentConfig = paymentConfig;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.commandeRepository = commandeRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // ─── INITIATION DU PAIEMENT ──────────────────────────────────────────────

    @Override
    public PaymentInitiateResponseDTO initiatePayment(PaymentInitiateRequestDTO request) {
        // 1. Trouver la commande et s'assurer que le statut initial est ATTENTE (non payé)
        Commande commande = commandeRepository.findByOrderNumber(request.orderNumber())
                .orElseThrow(() -> new RuntimeException(
                        "Commande introuvable avec le numéro : " + request.orderNumber()));

        commande.setPaymentStatus(Commande.PaymentStatus.ATTENTE);
        commandeRepository.save(commande);

        // 2. Construire le payload PayTech avec des URLs absolues complètes depuis la configuration
        String baseSuccessUrl = (paymentConfig.getSuccessUrl() != null && !paymentConfig.getSuccessUrl().isBlank())
                ? paymentConfig.getSuccessUrl()
                : "http://localhost:5173/?payment=success";
        String baseCancelUrl = (paymentConfig.getCancelUrl() != null && !paymentConfig.getCancelUrl().isBlank())
                ? paymentConfig.getCancelUrl()
                : "http://localhost:5173/?payment=cancel";

        String sepSuccess = baseSuccessUrl.contains("?") ? "&" : "?";
        String sepCancel = baseCancelUrl.contains("?") ? "&" : "?";

        String successUrl = (request.successUrl() != null && !request.successUrl().isBlank())
                ? request.successUrl()
                : baseSuccessUrl + sepSuccess + "order=" + commande.getOrderNumber();
        String cancelUrl = (request.cancelUrl() != null && !request.cancelUrl().isBlank())
                ? request.cancelUrl()
                : baseCancelUrl + sepCancel + "order=" + commande.getOrderNumber();

        // PayTech exige strictement une URL en HTTPS pour le webhook IPN serveur-à-serveur
        String ipnUrl = paymentConfig.getIpnUrl();
        if (ipnUrl == null || !ipnUrl.toLowerCase().startsWith("https://")) {
            ipnUrl = "https://lekkrek.com/api/v1/public/payments/ipn";
        }

        // URLs de retour dans le navigateur du client
        String finalSuccessUrl = successUrl;
        String finalCancelUrl = cancelUrl;

        // Intech / Wave exige une URL valide en HTTPS avec un domaine public (TLD).
        // En développement local, "http://localhost" déclenche l'erreur Intech "successRedirectUrl doit être un URL".
        // On encapsule donc l'URL locale via redirectmeto.com (utilitaire public dédié au callback localhost)
        // qui valide l'exigence HTTPS de Wave et renvoie immédiatement le navigateur vers http://localhost:5173.
        if (finalSuccessUrl != null && (finalSuccessUrl.startsWith("http://localhost") || finalSuccessUrl.startsWith("http://127.0.0.1"))) {
            finalSuccessUrl = "https://redirectmeto.com/" + finalSuccessUrl;
        }
        if (finalCancelUrl != null && (finalCancelUrl.startsWith("http://localhost") || finalCancelUrl.startsWith("http://127.0.0.1"))) {
            finalCancelUrl = "https://redirectmeto.com/" + finalCancelUrl;
        }

        Map<String, Object> paytechPayload = new LinkedHashMap<>();
        paytechPayload.put("item_name", "Commande LekkRek " + commande.getOrderNumber());
        paytechPayload.put("item_price", commande.getTotalAmount() != null ? commande.getTotalAmount().intValue() : 0);
        paytechPayload.put("currency", "XOF");
        paytechPayload.put("ref_command", commande.getOrderNumber());
        paytechPayload.put("command_name", "Paiement " + commande.getOrderNumber());
        paytechPayload.put("env", paymentConfig.getEnv() != null ? paymentConfig.getEnv() : "test");
        paytechPayload.put("ipn_url", ipnUrl);
        paytechPayload.put("success_url", finalSuccessUrl);
        paytechPayload.put("cancel_url", finalCancelUrl);
        // Compatibilité avec le sous-système Intech Wave (qui utilise les noms camelCase)
        paytechPayload.put("success_redirect_url", finalSuccessUrl);
        paytechPayload.put("cancel_redirect_url", finalCancelUrl);
        paytechPayload.put("successRedirectUrl", finalSuccessUrl);
        paytechPayload.put("errorRedirectUrl", finalCancelUrl);

        // Vérifier la présence des clés d'API PayTech
        if (paymentConfig.getApiKey() == null || paymentConfig.getApiKey().isBlank()
                || paymentConfig.getApiSecret() == null || paymentConfig.getApiSecret().isBlank()) {
            log.error("Clés PayTech non configurées ! Veuillez renseigner PAYTECH_API_KEY et PAYTECH_API_SECRET dans le fichier .env");
            return new PaymentInitiateResponseDTO(
                    false,
                    null,
                    null,
                    commande.getOrderNumber(),
                    "Configuration incomplète : Les clés PayTech (PAYTECH_API_KEY et PAYTECH_API_SECRET) doivent être définies dans votre fichier .env"
            );
        }

        // Les en-têtes d'auth PayTech
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("API_KEY", paymentConfig.getApiKey());
        headers.set("API_SECRET", paymentConfig.getApiSecret());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(paytechPayload, headers);

        try {
            // 3. Appel à l'API PayTech
            String targetUrl = Objects.requireNonNull(paymentConfig.getRequestUrl());
            ResponseEntity<String> response = restTemplate.exchange(
                    targetUrl,
                    Objects.requireNonNull(HttpMethod.POST),
                    entity,
                    String.class
            );

            JsonNode json = objectMapper.readTree(response.getBody());
            int success = json.has("success") ? json.get("success").asInt() : 0;

            if (success == 1 && json.has("token") && json.has("redirect_url")) {
                String token = json.get("token").asText();
                String redirectUrl = json.get("redirect_url").asText();

                // 4. Créer la PaymentTransaction en base (PENDING)
                PaymentTransaction tx = new PaymentTransaction();
                tx.setOrderNumber(commande.getOrderNumber());
                tx.setPaytechToken(token);
                tx.setRedirectUrl(redirectUrl);
                tx.setAmount(commande.getTotalAmount());
                tx.setCurrency("XOF");
                tx.setStatus(PaymentTransaction.TransactionStatus.PENDING);
                paymentTransactionRepository.save(tx);

                log.info("Paiement PayTech initié pour commande {} — token: {}", commande.getOrderNumber(), token);

                return new PaymentInitiateResponseDTO(
                        true,
                        redirectUrl,
                        token,
                        commande.getOrderNumber(),
                        "Paiement initié avec succès. Redirigez le client vers l'URL PayTech."
                );
            } else {
                String errors = json.has("errors") ? json.get("errors").toString() : "Erreur inconnue PayTech";
                log.error("Erreur PayTech pour commande {} — réponse: {}", commande.getOrderNumber(), response.getBody());

                return new PaymentInitiateResponseDTO(
                        false,
                        null,
                        null,
                        commande.getOrderNumber(),
                        "Erreur PayTech : " + errors
                );
            }
        } catch (Exception e) {
            log.error("Exception lors de l'appel PayTech pour commande {}", commande.getOrderNumber(), e);
            String errorDetail = e.getMessage();
            if (e instanceof org.springframework.web.client.HttpStatusCodeException httpEx) {
                errorDetail = "HTTP " + httpEx.getStatusCode() + " : " + httpEx.getResponseBodyAsString();
            }
            return new PaymentInitiateResponseDTO(
                    false,
                    null,
                    null,
                    commande.getOrderNumber(),
                    "Erreur technique lors de l'initiation du paiement : " + errorDetail
            );
        }
    }

    // ─── TRAITEMENT IPN ──────────────────────────────────────────────────────

    @Override
    public void handleIpn(Map<String, String> payload) {
        log.info("IPN PayTech reçu : {}", payload);

        String typeEvent = payload.getOrDefault("type_event", "");
        String refCommand = payload.getOrDefault("ref_command", "");
        String paymentMethod = payload.getOrDefault("payment_method", "");

        // Stocker le payload brut pour audit
        String rawPayload;
        try {
            rawPayload = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            rawPayload = payload.toString();
        }

        // Retrouver la transaction par ref_command
        List<PaymentTransaction> transactions =
                paymentTransactionRepository.findByOrderNumberOrderByCreatedAtDesc(refCommand);

        if (transactions.isEmpty()) {
            log.warn("IPN reçu pour commande inconnue : {}", refCommand);
            return;
        }

        PaymentTransaction tx = transactions.get(0); // La plus récente
        tx.setIpnPayload(rawPayload);

        // Retrouver la commande
        Optional<Commande> commandeOpt = commandeRepository.findByOrderNumber(refCommand);

        switch (typeEvent.toLowerCase()) {
            case "sale_complete":
                tx.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
                commandeOpt.ifPresent(c -> {
                    c.setPaymentStatus(Commande.PaymentStatus.PAYE);
                    commandeRepository.save(c);
                });
                log.info("Paiement COMPLÉTÉ pour commande {} via {}", refCommand, paymentMethod);
                break;

            case "sale_canceled":
                tx.setStatus(PaymentTransaction.TransactionStatus.CANCELLED);
                commandeOpt.ifPresent(c -> {
                    c.setPaymentStatus(Commande.PaymentStatus.ECHOUE);
                    commandeRepository.save(c);
                });
                log.info("Paiement ANNULÉ pour commande {}", refCommand);
                break;

            case "sale_refused":
                tx.setStatus(PaymentTransaction.TransactionStatus.FAILED);
                commandeOpt.ifPresent(c -> {
                    c.setPaymentStatus(Commande.PaymentStatus.ECHOUE);
                    commandeRepository.save(c);
                });
                log.info("Paiement REFUSÉ pour commande {}", refCommand);
                break;

            default:
                log.warn("Type d'événement IPN inconnu : {} pour commande {}", typeEvent, refCommand);
                break;
        }

        paymentTransactionRepository.save(tx);
    }

    // ─── CONSULTATION ADMIN ──────────────────────────────────────────────────

    @Override
    public List<PaymentTransactionDTO> getTransactionsByOrder(String orderNumber) {
        return paymentTransactionRepository.findByOrderNumberOrderByCreatedAtDesc(orderNumber)
                .stream()
                .map(tx -> new PaymentTransactionDTO(
                        tx.getId(),
                        tx.getOrderNumber(),
                        tx.getPaytechToken(),
                        tx.getStatus().name(),
                        tx.getAmount(),
                        tx.getCurrency(),
                        tx.getRedirectUrl(),
                        tx.getCreatedAt(),
                        tx.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }
}
