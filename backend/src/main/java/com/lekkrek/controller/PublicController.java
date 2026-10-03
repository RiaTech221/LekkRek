package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : PublicController.java
 * 📝 Description : Classe métier pour la gestion de PublicController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${api.prefix.public}")
public class PublicController {

    @GetMapping("/ping")
    public String ping() {
        return "Bienvenue sur l'API Lekk Rek ! L'architecture tourne parfaitement.";
    }
}
