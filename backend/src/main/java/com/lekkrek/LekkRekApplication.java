package com.lekkrek;

/**
 * ============================================================================
 * 📁 Fichier : LekkRekApplication.java
 * 📝 Description : Classe métier pour la gestion de LekkRekApplication dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LekkRekApplication {

    public static void main(String[] args) {
        SpringApplication.run(LekkRekApplication.class, args);
    }
}
