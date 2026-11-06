package com.lekkrek.dto.payment;

/**
 * ============================================================================
 * 📁 Fichier : PaymentInitiateResponseDTO.java
 * 📝 Description : DTO de réponse à l'initiation d'un paiement PayTech.
 * ============================================================================
 */

/**
 * Réponse retournée au frontend après l'initiation du paiement.
 *
 * @param success     true si PayTech a bien créé la session de paiement
 * @param redirectUrl URL PayTech vers laquelle rediriger le client pour paiement
 * @param token       Token PayTech identifiant la session de paiement
 * @param orderNumber Numéro de la commande LekkRek
 * @param message     Message informatif
 */
public record PaymentInitiateResponseDTO(
        boolean success,
        String redirectUrl,
        String token,
        String orderNumber,
        String message
) {}
