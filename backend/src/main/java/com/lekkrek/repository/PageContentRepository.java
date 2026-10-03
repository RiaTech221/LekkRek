package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : PageContentRepository.java
 * 📝 Description : Classe métier pour la gestion de PageContentRepository dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.PageContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PageContentRepository extends JpaRepository<PageContent, Long> {
    Optional<PageContent> findBySlug(String slug);
}
