package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : PlatRequestDTO.java
 * 📝 Description : Classe métier pour la gestion de PlatRequestDTO dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.validation.constraints.*;

public record PlatRequestDTO(

    @NotBlank(message = "Le nom du plat est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    String name,

    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    String description,

    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
    Double price,

    String image,
    String moment,
    String variantes,

    @NotBlank(message = "Le statut est obligatoire")
    String status,

    @NotNull(message = "L'identifiant du restaurant est obligatoire")
    Long restaurantId
) {}
