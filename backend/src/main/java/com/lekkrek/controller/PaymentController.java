package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : PaymentController.java
 * 📝 Description : Controller REST pour la gestion des paiements PayTech.
 *                 Initiation de paiement, réception IPN, et consultation admin.
 * 🔒 Rôle : Endpoints publics (paiement + IPN) et admin (consultation).
 * ============================================================================
 */

import com.lekkrek.dto.payment.PaymentInitiateRequestDTO;
import com.lekkrek.dto.payment.PaymentInitiateResponseDTO;
import com.lekkrek.dto.payment.PaymentTransactionDTO;
import com.lekkrek.service.PaymentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initier un paiement PayTech pour une commande existante.
     * Le frontend appelle ce endpoint puis redirige le client vers l'URL retournée.
     *
     * POST /api/v1/public/payments/initiate
     */
    @PostMapping("${api.prefix.public:/api/v1/public}/payments/initiate")
    public ResponseEntity<PaymentInitiateResponseDTO> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequestDTO request) {

        PaymentInitiateResponseDTO response = paymentService.initiatePayment(request);
        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Endpoint IPN (Instant Payment Notification) appelé par PayTech
     * de serveur à serveur pour confirmer un paiement.
     *
     * POST /api/v1/public/payments/ipn
     *
     * La sécurité est assurée côté PayTech (serveur à serveur, pas accessible au client).
     */
    @PostMapping("${api.prefix.public:/api/v1/public}/payments/ipn")
    public ResponseEntity<String> handlePaytechIpn(@RequestParam Map<String, String> payload) {
        log.info("Réception IPN PayTech : {}", payload);
        try {
            paymentService.handleIpn(payload);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Erreur lors du traitement IPN", e);
            return ResponseEntity.internalServerError().body("Erreur lors du traitement de l'IPN");
        }
    }

    /**
     * Consulter les transactions de paiement d'une commande (ADMIN uniquement).
     *
     * GET /api/v1/admin/payments/{orderNumber}
     */
    @GetMapping("${api.prefix.admin:/api/v1/admin}/payments/{orderNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentTransactionDTO>> getPaymentsByOrder(
            @PathVariable String orderNumber) {

        List<PaymentTransactionDTO> transactions = paymentService.getTransactionsByOrder(orderNumber);
        return ResponseEntity.ok(transactions);
    }
}
