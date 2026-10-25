package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : JwtResponseDTO.java
 * 📝 Description : Réponse d'authentification incluant la liste des restaurants
 *                 assignés à l'utilisateur (0..n).
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Standard Enterprise
 * ============================================================================
 */

import java.util.List;

public record JwtResponseDTO(
        String token,
        String type,
        String email,
        List<String> roles,
        List<RestaurantSummaryDTO> restaurants
) {
    public JwtResponseDTO(String token, String email, List<String> roles, List<RestaurantSummaryDTO> restaurants) {
        this(token, "Bearer", email, roles, restaurants != null ? restaurants : List.of());
    }

    public JwtResponseDTO(String token, String email, List<String> roles) {
        this(token, "Bearer", email, roles, List.of());
    }
}
