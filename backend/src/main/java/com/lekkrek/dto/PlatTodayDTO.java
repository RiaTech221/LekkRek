package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : PlatTodayDTO.java
 * 📝 Description : DTO unifié pour l'exposition publique des plats du jour.
 * 🔒 Rôle : Rendu compatible avec DishCard.jsx et la vitrine client.
 * ============================================================================
 */

import com.lekkrek.entity.Restaurant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatTodayDTO {

    private Long id; // ID du plat
    private Long platId;
    private Long offreId; // Null si issu de la grille hebdomadaire

    private String name;
    private String description;
    private BigDecimal price;

    @JsonProperty("prixEmporter")
    private BigDecimal prixEmporter;

    private String image;
    private String status; // Toujours 'DISPO'
    private String moment;

    @JsonProperty("isOffreSpeciale")
    private boolean isOffreSpeciale;

    private Restaurant restaurant;
}
