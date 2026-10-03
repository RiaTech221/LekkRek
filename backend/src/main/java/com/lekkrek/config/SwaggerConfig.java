package com.lekkrek.config;

/**
 * ============================================================================
 * 📁 Fichier : SwaggerConfig.java
 * 📝 Description : Classe métier pour la gestion de SwaggerConfig dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI lekkRekOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Lekk Rek API")
                .description("API REST pour la plateforme de livraison Lekk Rek (Casamance)")
                .version("v1.0.0"));
    }
}
