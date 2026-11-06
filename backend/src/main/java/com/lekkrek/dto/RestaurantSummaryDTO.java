package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : RestaurantSummaryDTO.java
 * 📝 Description : DTO synthétique représentant un restaurant (id, nom).
 * 🔒 Rôle : Utilisé dans les réponses JWT / Profils opérateurs.
 * 💡 Auteur : Standard Enterprise
 * ============================================================================
 */

public record RestaurantSummaryDTO(Long id, String name) {}
