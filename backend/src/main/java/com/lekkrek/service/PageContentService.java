package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : PageContentService.java
 * 📝 Description : Classe métier pour la gestion de PageContentService dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.dto.PageContentRequestDTO;
import com.lekkrek.entity.PageContent;
import com.lekkrek.repository.PageContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PageContentService {

    private final PageContentRepository pageContentRepository;

    public PageContent getPageBySlug(String slug) {
        return pageContentRepository.findBySlug(slug)
                .orElseGet(() -> {
                    // Si la page n'existe pas encore, on renvoie une coquille vide pour l'interface
                    return PageContent.builder()
                            .slug(slug)
                            .title("Titre par défaut")
                            .content("")
                            .seoKeywords("")
                            .build();
                });
    }

    @Transactional
    public PageContent updateOrCreatePage(String slug, PageContentRequestDTO dto) {
        PageContent page = pageContentRepository.findBySlug(slug)
                .orElseGet(() -> PageContent.builder().slug(slug).build());
        
        page.setTitle(dto.getTitle());
        page.setSeoKeywords(dto.getSeoKeywords());
        page.setContent(dto.getContent());

        return pageContentRepository.save(page);
    }
}
