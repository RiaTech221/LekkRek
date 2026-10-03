package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : PageContent.java
 * 📝 Description : Classe métier pour la gestion de PageContent dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "page_contents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug; // e.g., 'about', 'terms', 'privacy'

    @Column(nullable = false)
    private String title;

    @Column(name = "seo_keywords")
    private String seoKeywords;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
