package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : PageContentController.java
 * 📝 Description : Classe métier pour la gestion de PageContentController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.dto.PageContentRequestDTO;
import com.lekkrek.entity.PageContent;
import com.lekkrek.service.PageContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pages")
@RequiredArgsConstructor
public class PageContentController {

    private final PageContentService pageContentService;

    // Public endpoint : tout le monde (la vitrine) peut lire
    @GetMapping("/{slug}")
    public ResponseEntity<PageContent> getPage(@PathVariable String slug) {
        return ResponseEntity.ok(pageContentService.getPageBySlug(slug));
    }

    // Protected endpoint : seul l'Admin peut écrire
    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageContent> updatePage(
            @PathVariable String slug,
            @RequestBody PageContentRequestDTO dto) {
        return ResponseEntity.ok(pageContentService.updateOrCreatePage(slug, dto));
    }
}
