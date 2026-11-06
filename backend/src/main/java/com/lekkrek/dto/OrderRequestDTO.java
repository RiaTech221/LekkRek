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
        regexp = "^(?:(?:\\+|00)?221)?[\\s.-]?(70|75|76|77|78|33)[\\s.-]?[0-9]{3}[\\s.-]?[0-9]{2}[\\s.-]?[0-9]{2}$",
        message = "Le numéro de téléphone doit être un numéro sénégalais valide (ex: 771234567 ou +221 77 123 45 67)"
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
