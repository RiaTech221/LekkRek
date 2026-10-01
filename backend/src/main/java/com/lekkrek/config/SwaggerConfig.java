package com.lekkrek.config;

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
