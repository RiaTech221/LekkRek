package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : PlatRequestDTO.java
 * 📝 Description : Classe métier pour la gestion de PlatRequestDTO dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


public record PlatRequestDTO(
        String name,
        String description,
        Double price,
        String image,
        String moment,
        String variantes,
        String status,
        Long restaurantId
) {}
