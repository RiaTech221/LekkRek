package com.lekkrek.dto.payment;

/**
 * ============================================================================
 * 📁 Fichier : PaymentInitiateRequestDTO.java
 * 📝 Description : DTO de demande d'initiation de paiement PayTech.
 * ============================================================================
 */

import jakarta.validation.constraints.NotBlank;

/**
 * Corps de la requête POST /api/v1/public/payments/initiate
 *
 * @param orderNumber  Numéro de la commande LekkRek (ex: CMD-ABCD1234)
 * @param successUrl   URL de redirection après paiement réussi (optionnel)
 * @param cancelUrl    URL de redirection en cas d'annulation (optionnel)
 */
public record PaymentInitiateRequestDTO(
        @NotBlank(message = "Le numéro de commande est obligatoire")
        String orderNumber,

        String successUrl,

        String cancelUrl
) {}

