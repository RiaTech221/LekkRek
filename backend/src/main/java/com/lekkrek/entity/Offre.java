package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : Offre.java
 * 📝 Description : Entité représentant les offres datées (plat du jour et historique).
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot (module Offres / Tarification).
 * 💡 Aligné exactement sur 01-migration-lekkrek.sql
 * ============================================================================
 */

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "offres",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_offre_plat_date_moment", columnNames = {"plat_id", "date_offre", "moment"})
    },
    indexes = {
        @Index(name = "idx_offre_date", columnList = "date_offre")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Offre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plat_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Plat plat;

    @Column(name = "date_offre", nullable = false)
    private LocalDate dateOffre;

    @Column(nullable = false, length = 50)
    private String moment;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prix;

    @Column(name = "prix_emporter", precision = 10, scale = 2)
    private BigDecimal prixEmporter;

    @Column(nullable = false, length = 50, columnDefinition = "varchar(50) default 'DISPO'")
    private String statut = "DISPO"; // DISPO | EPUISE

    @Column(name = "created_at", updatable = false, columnDefinition = "datetime default current_timestamp")
    private LocalDateTime createdAt = LocalDateTime.now();
}
