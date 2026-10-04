package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : PlatformSettings.java
 * 📝 Description : Classe métier pour la gestion de PlatformSettings dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "platform_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformSettings {

    @Id
    private Long id; // Toujours 1, car il n'y a qu'une seule configuration globale

    @Column(nullable = false)
    private String platformName;

    private String supportEmail;
    private String supportPhone;
    
    @Column(nullable = false)
    private String defaultCurrency;

    private String instagramUrl;
    private String facebookUrl;
    private String tiktokUrl;

    @Column(columnDefinition = "TEXT")
    private String whatsappMessageGreeting = "Bonjour l'équipe LekkRek 👋, ";
    
    @Column(columnDefinition = "TEXT")
    private String whatsappMessageCart = "J'ai actuellement {count} plat(s) dans mon panier pour un total de {total} FCFA et j'aimerais avoir de l'aide pour finaliser ma commande.";
    
    @Column(columnDefinition = "TEXT")
    private String whatsappMessageOrder = "Je vous contacte concernant ma commande N° {orderNumber}.";
    
    @Column(columnDefinition = "TEXT")
    private String whatsappMessageDefault = "j'aimerais avoir de plus amples informations s'il vous plaît.";
}
