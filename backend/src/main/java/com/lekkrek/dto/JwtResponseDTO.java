package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : JwtResponseDTO.java
 * 📝 Description : Classe métier pour la gestion de JwtResponseDTO dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import java.util.List;

public record JwtResponseDTO(String token, String type, String email, List<String> roles) {
    public JwtResponseDTO(String token, String email, List<String> roles) {
        this(token, "Bearer", email, roles);
    }
}
