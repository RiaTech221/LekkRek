package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : AnalyticsController.java
 * 📝 Description : Classe métier pour la gestion de AnalyticsController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.dto.AnalyticsRequestDTO;
import com.lekkrek.entity.AnalyticsEvent;
import com.lekkrek.repository.AnalyticsEventRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
public class AnalyticsController {

    private final AnalyticsEventRepository analyticsEventRepository;

    public AnalyticsController(AnalyticsEventRepository analyticsEventRepository) {
        this.analyticsEventRepository = analyticsEventRepository;
    }

    // Public endpoint to record an event
    @PostMapping("${api.prefix.public:/api/v1/public}/analytics")
    public void recordEvent(@Valid @RequestBody AnalyticsRequestDTO request) {
        AnalyticsEvent event = new AnalyticsEvent(request.eventType(), request.entityId(), request.context());
        analyticsEventRepository.save(event);
    }

    // Admin endpoint to get KPI data
    @GetMapping("${api.prefix.admin:/api/v1/admin}/analytics/kpi")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getKpiData() {
        Map<String, Object> response = new HashMap<>();
        response.put("totals", analyticsEventRepository.countEventsByType());
        response.put("topSearches", analyticsEventRepository.getTopSearches());
        return response;
    }
}
