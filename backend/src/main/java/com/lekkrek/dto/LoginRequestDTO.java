package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : LoginRequestDTO.java
 * 📝 Description : Classe métier pour la gestion de LoginRequestDTO dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.validation.constraints.*;

public record LoginRequestDTO(
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Size(max = 150)
    String email,

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, max = 100, message = "Le mot de passe doit faire entre 6 et 100 caractères")
    String password
) {}
