package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : DocumentParserController.java
 * 📝 Description : Classe métier pour la gestion de DocumentParserController dans LekkRek.
 * 🛠 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 👨‍💻 Auteur : Standard Enterprise Security
 * ============================================================================
 */


import org.apache.tika.Tika;
import org.apache.tika.utils.XMLReaderUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix.admin:/api/v1/admin}/documents")
public class DocumentParserController {

    @PostConstruct
    public void secureTika() {
        try {
            // Désactiver les DTD et entités externes pour prévenir les failles XXE
            XMLReaderUtils.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            XMLReaderUtils.setFeature("http://xml.org/sax/features/external-general-entities", false);
            XMLReaderUtils.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PostMapping("/parse")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> parseDocument(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            Tika tika = new Tika();
            // Limiter la taille du texte extrait pour éviter les attaques par épuisement de mémoire (Billion laughs / Zip bomb)
            tika.setMaxStringLength(5 * 1024 * 1024); // Limite à 5 Mo de texte

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
