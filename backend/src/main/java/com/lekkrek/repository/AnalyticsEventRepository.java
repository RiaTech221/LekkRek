package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : AnalyticsEventRepository.java
 * 📝 Description : Classe métier pour la gestion de AnalyticsEventRepository dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {
    
    @Query("SELECT a.eventType as eventType, COUNT(a) as count FROM AnalyticsEvent a GROUP BY a.eventType")
    List<Map<String, Object>> countEventsByType();

    @Query("SELECT a.entityId as query, COUNT(a) as count FROM AnalyticsEvent a WHERE a.eventType = 'search' GROUP BY a.entityId ORDER BY count DESC LIMIT 5")
    List<Map<String, Object>> getTopSearches();
}
