package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : AnalyticsRequestDTO.java
 * 📝 Description : Classe métier pour la gestion de AnalyticsRequestDTO dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


public record AnalyticsRequestDTO(String eventType, String entityId, String context) {}
