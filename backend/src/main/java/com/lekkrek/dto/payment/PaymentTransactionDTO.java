package com.lekkrek.dto.payment;

/**
 * ============================================================================
 * 📁 Fichier : PaymentTransactionDTO.java
 * 📝 Description : DTO de consultation d'une transaction de paiement (vue admin).
 * ============================================================================
 */

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Vue admin d'une transaction de paiement.
 *
 * @param id           Identifiant interne
 * @param orderNumber  Numéro de commande
 * @param paytechToken Token PayTech
 * @param status       État (PENDING / COMPLETED / CANCELLED / FAILED)
 * @param amount       Montant en XOF
 * @param currency     Devise
 * @param redirectUrl  URL de paiement PayTech
 * @param createdAt    Date de création
 * @param updatedAt    Date de mise à jour
 */
public record PaymentTransactionDTO(
        Long id,
        String orderNumber,
        String paytechToken,
        String status,
        BigDecimal amount,
        String currency,
        String redirectUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
