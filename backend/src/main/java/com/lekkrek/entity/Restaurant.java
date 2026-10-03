package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : Restaurant.java
 * 📝 Description : Classe métier pour la gestion de Restaurant dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    private String image;

    private String operatorName; // The person managing it

    private boolean active = true;

    @Column(nullable = false, columnDefinition = "double default 10.0")
    private Double commissionRate = 10.0;

    private String subscriptionPlan = "Basic";

    private LocalDate subscriptionEndDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
