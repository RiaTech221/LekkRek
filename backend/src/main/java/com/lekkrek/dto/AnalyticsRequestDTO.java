package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : AnalyticsRequestDTO.java
 * 📝 Description : DTO de requête pour l'enregistrement d'événements analytics.
 * 🔒 Rôle : Validation stricte des types d'événements autorisés et limitation des tailles.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AnalyticsRequestDTO(
        @NotBlank(message = "Le type d'événement est obligatoire")
        @Pattern(
                regexp = "^(click_whatsapp|click_phone|search|view_offer|view_dish|view_restaurant|view_menu)$",
                message = "Type d'événement non autorisé"
        )
        String eventType,

        @Size(max = 255, message = "L'identifiant de l'entité ne doit pas dépasser 255 caractères")
        String entityId,

        @Size(max = 500, message = "Le contexte ne doit pas dépasser 500 caractères")
        String context
) {}
