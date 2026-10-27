package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : Utilisateur.java
 * 📝 Description : Classe métier pour la gestion de Utilisateur dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomComplet;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // ADMIN, OPERATEUR

    @Column(nullable = false)
    private Boolean actif = true;

    /**
     * Indique si l'utilisateur doit obligatoirement changer son mot de passe
     * lors de sa prochaine connexion (par exemple après création d'un compte avec mot de passe provisoire).
     */
    @Column(name = "doit_changer_mot_de_passe", nullable = false)
    private Boolean doitChangerMotDePasse = false;

    private String photoUrl;

    @Deprecated
    private String restaurantAssigne;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "operateur_restaurants",
        joinColumns = @JoinColumn(name = "utilisateur_id"),
        inverseJoinColumns = @JoinColumn(name = "restaurant_id")
    )
    private java.util.Set<Restaurant> restaurants = new java.util.HashSet<>();

    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("restaurantIds")
    private java.util.Set<Long> restaurantIds;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    public enum Role {
        ADMIN,
        OPERATEUR
    }
}
