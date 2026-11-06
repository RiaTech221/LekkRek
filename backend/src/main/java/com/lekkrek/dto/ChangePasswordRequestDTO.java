package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : ChangePasswordRequestDTO.java
 * 📝 Description : DTO pour la requête de changement de mot de passe (notamment
 *                 lors de la première connexion avec mot de passe provisoire).
 * 🔒 Rôle : Validation stricte des contraintes de sécurité (mot de passe fort).
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequestDTO(
        @NotBlank(message = "Le mot de passe actuel est obligatoire")
        String currentPassword,

        @NotBlank(message = "Le nouveau mot de passe est obligatoire")
        @Size(min = 8, message = "Le nouveau mot de passe doit comporter au moins 8 caractères")
        String newPassword
) {}
