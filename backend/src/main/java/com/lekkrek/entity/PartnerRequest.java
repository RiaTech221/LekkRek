package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : PartnerRequest.java
 * 📝 Description : Classe métier pour la gestion de PartnerRequest dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "partner_requests")
public class PartnerRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le nom du restaurant est obligatoire")
    @Size(min = 2, message = "Le nom du restaurant doit contenir au moins 2 caractères")
    private String nomRestaurant;
    
    @NotBlank(message = "Le nom du contact est obligatoire")
    @Size(min = 2, message = "Le nom du contact doit contenir au moins 2 caractères")
    private String nomContact;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^(77|78|76|75|70|33)\\d{7}$", message = "Format de téléphone invalide")
    private String telephone;
    
    @NotBlank(message = "La ville est obligatoire")
    @Size(min = 3, message = "La ville doit contenir au moins 3 caractères")
    private String ville;
    
    private String status = "PENDING";
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public PartnerRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomRestaurant() { return nomRestaurant; }
    public void setNomRestaurant(String nomRestaurant) { this.nomRestaurant = nomRestaurant; }
    public String getNomContact() { return nomContact; }
    public void setNomContact(String nomContact) { this.nomContact = nomContact; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
