package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : Plat.java
 * 📝 Description : Classe métier pour la gestion de Plat dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "plats")
@Data
@NoArgsConstructor
public class Plat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Double price;

    private String image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DishStatus status = DishStatus.DISPO;

    private String moment; // e.g., dejeuner, diner, gouter

    @Column(length = 255)
    private String variantes; // Liste de synonymes séparés par des virgules

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    public enum DishStatus {
        DISPO,
        EPUISE
    }
}
