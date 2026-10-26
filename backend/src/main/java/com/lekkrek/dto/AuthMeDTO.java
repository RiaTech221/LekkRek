package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : AuthMeDTO.java
 * 📝 Description : Session courante retournée par GET /auth/me.
 * 🔒 Rôle : Le front restaure la session (email, rôles, restaurants, statut mot de passe)
 *           sans jamais lire le JWT, qui reste stocké en cookie HttpOnly côté navigateur (Option A).
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import java.util.List;

public record AuthMeDTO(
        String email,
        List<String> roles,
        List<RestaurantSummaryDTO> restaurants,
        boolean doitChangerMotDePasse
) {
    public AuthMeDTO(String email, List<String> roles) {
        this(email, roles, List.of(), false);
    }
}
