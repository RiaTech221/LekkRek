package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : OrderRequestDTO.java
 * 📝 Description : Classe métier pour la gestion de OrderRequestDTO dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.validation.constraints.*;
import java.util.List;

public record OrderRequestDTO(

    @NotBlank(message = "Le nom du client est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    String clientName,

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(
        regexp = "^(77|78|76|75|70|33)[0-9]{7}$",
        message = "Le numéro de téléphone doit être un numéro sénégalais valide à 9 chiffres (ex: 771234567)"
    )
    String clientPhone,

    @Size(max = 200, message = "L'adresse ne peut pas dépasser 200 caractères")
    String clientAddress,

    @NotBlank(message = "Le type de commande est obligatoire")
    String type,

    @NotBlank(message = "Le mode de paiement est obligatoire")
    String paymentMethod,

    @NotEmpty(message = "La commande doit contenir au moins un plat")
    @Size(max = 20, message = "Une commande ne peut pas contenir plus de 20 plats")
    List<Long> platIds
) {}
