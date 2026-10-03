package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : AuditLog.java
 * 📝 Description : Classe métier pour la gestion de AuditLog dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_email")
    private String actorEmail;

    private String role;
    private String action; // CREATE, UPDATE, DEACTIVATE, PUBLISH
    
    @Column(name = "entity_type")
    private String entityType; // Restaurant, Plat, Offre, Commande

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    private LocalDateTime timestamp;

    public AuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public AuditLog(String actorEmail, String role, String action, String entityType, String entityId, String oldValue, String newValue) {
        this.actorEmail = actorEmail;
        this.role = role;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getActorEmail() { return actorEmail; }
    public String getRole() { return role; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public String getEntityId() { return entityId; }
    public String getOldValue() { return oldValue; }
    public String getNewValue() { return newValue; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
