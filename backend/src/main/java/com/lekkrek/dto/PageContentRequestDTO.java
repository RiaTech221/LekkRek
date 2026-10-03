package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : PageContentRequestDTO.java
 * 📝 Description : Classe métier pour la gestion de PageContentRequestDTO dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageContentRequestDTO {
    private String title;
    private String seoKeywords;
    private String content;
}
