package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : CommandeItem.java
 * 📝 Description : Classe métier pour la gestion de CommandeItem dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "commande_items")
@Data
@NoArgsConstructor
public class CommandeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Commande commande;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plat_id", nullable = false)
    private Plat plat;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;
}
