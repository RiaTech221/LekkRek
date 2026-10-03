package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : AnalyticsEvent.java
 * 📝 Description : Classe métier pour la gestion de AnalyticsEvent dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_events")
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type")
    private String eventType; // click_whatsapp, click_phone, search, view_offer

    @Column(name = "entity_id")
    private String entityId; // plat_id, restaurant_id, or search query

    @Column(name = "context", columnDefinition = "TEXT")
    private String context; // Additional context if needed

    private LocalDateTime timestamp;

    public AnalyticsEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public AnalyticsEvent(String eventType, String entityId, String context) {
        this.eventType = eventType;
        this.entityId = entityId;
        this.context = context;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getEventType() { return eventType; }
    public String getEntityId() { return entityId; }
    public String getContext() { return context; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
