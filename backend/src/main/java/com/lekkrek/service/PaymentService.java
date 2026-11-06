package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : PaymentService.java
 * 📝 Description : Interface du service de paiement PayTech.
 * 🔒 Rôle : Abstraction pour l'initiation et le traitement IPN.
 * ============================================================================
 */

import com.lekkrek.dto.payment.PaymentInitiateRequestDTO;
import com.lekkrek.dto.payment.PaymentInitiateResponseDTO;
import com.lekkrek.dto.payment.PaymentTransactionDTO;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    /**
     * Initie une session de paiement PayTech pour une commande existante.
     */
    PaymentInitiateResponseDTO initiatePayment(PaymentInitiateRequestDTO request);

    /**
     * Traite la notification IPN envoyée par PayTech après un paiement.
     * Met à jour PaymentTransaction + PaymentStatus de la Commande.
     */
    void handleIpn(Map<String, String> payload);

    /**
     * Récupère l'historique des transactions de paiement pour une commande (admin).
     */
    List<PaymentTransactionDTO> getTransactionsByOrder(String orderNumber);
}
