package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : DocumentParserController.java
 * 📝 Description : Classe métier pour la gestion de DocumentParserController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import org.apache.tika.Tika;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix.admin:/api/v1/admin}/documents")
public class DocumentParserController {

    @PostMapping("/parse")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> parseDocument(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            Tika tika = new Tika();
            String extractedText = tika.parseToString(file.getInputStream());
            
            // Basic formatting: wrap paragraphs in <p> to adapt to Rich Text Editor
            String formattedHtml = extractedText.replaceAll("(?m)^\\s*$", "").replaceAll("(?m)^(.+)$", "<p>$1</p>");
            
            response.put("text", formattedHtml);
            response.put("status", "success");
        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Impossible de lire le fichier: " + e.getMessage());
        }
        return response;
    }
}
