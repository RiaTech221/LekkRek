package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : OrderRequestDTO.java
 * 📝 Description : Classe métier pour la gestion de OrderRequestDTO dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import java.util.List;

public record OrderRequestDTO(
    String clientName,
    String clientPhone,
    String clientAddress,
    String type,
    String paymentMethod,
    List<Long> platIds
) {}
