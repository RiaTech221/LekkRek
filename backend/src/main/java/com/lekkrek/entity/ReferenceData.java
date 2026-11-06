package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : ReferenceData.java
 * 📝 Description : Entité de données de référence (Quartiers, Créneaux, Catégories)
 * 🔒 Rôle : Gestion des données de paramétrage - SOL-192 / SOL-193
 * ============================================================================
 */

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reference_data")
@Data
@NoArgsConstructor
public class ReferenceData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type; // QUARTIER, CRENEAU, CATEGORIE

    @Column(nullable = false)
    private String valeur; // La valeur (ex: "Boucotte", "dejeuner", "Plats locaux")

    @Column
    private String description; // Optionnel

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Type {
        QUARTIER,
        CRENEAU,
        CATEGORIE
    }
}
