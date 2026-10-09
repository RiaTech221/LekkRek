package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : ReferenceDataController.java
 * 📝 Description : API REST pour gérer les données de référence
 *                  (Quartiers, Créneaux, Catégories) - SOL-192 / SOL-193
 * 🔒 Rôle : Endpoints Admin + Public (lecture)
 * ============================================================================
 */

import com.lekkrek.entity.ReferenceData;
import com.lekkrek.repository.ReferenceDataRepository;
import com.lekkrek.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ReferenceDataController {

    private final ReferenceDataRepository referenceDataRepository;
    private final AuditService auditService;

    public ReferenceDataController(ReferenceDataRepository referenceDataRepository, AuditService auditService) {
        this.referenceDataRepository = referenceDataRepository;
        this.auditService = auditService;
    }

    // ==========================================
    // ENDPOINTS PUBLICS (lecture seule)
    // ==========================================

    @GetMapping("${api.prefix.public:/api/v1/public}/reference/{type}")
    public List<ReferenceData> getPublicByType(@PathVariable String type) {
        ReferenceData.Type t = ReferenceData.Type.valueOf(type.toUpperCase());
        return referenceDataRepository.findByTypeAndActifTrueOrderByValeurAsc(t);
    }

    // ==========================================
    // ENDPOINTS ADMIN (CRUD complet)
    // ==========================================

    @GetMapping("${api.prefix.admin:/api/v1/admin}/reference")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReferenceData> getAll() {
        return referenceDataRepository.findAll();
    }

    @GetMapping("${api.prefix.admin:/api/v1/admin}/reference/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReferenceData> getByType(@PathVariable String type) {
        ReferenceData.Type t = ReferenceData.Type.valueOf(type.toUpperCase());
        return referenceDataRepository.findByTypeOrderByValeurAsc(t);
    }

    @PostMapping("${api.prefix.admin:/api/v1/admin}/reference")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody ReferenceData data) {
        if (referenceDataRepository.existsByTypeAndValeur(data.getType(), data.getValeur())) {
            return ResponseEntity.badRequest().body("Cette valeur existe déjà pour ce type.");
        }
        data.setActif(true);
        ReferenceData saved = referenceDataRepository.save(data);
        auditService.logCurrentAction("CREATE_REFERENCE", "ReferenceData",
            saved.getId().toString(), null,
            "Création " + saved.getType() + ": " + saved.getValeur());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("${api.prefix.admin:/api/v1/admin}/reference/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ReferenceData updated) {
        return referenceDataRepository.findById(id).map(data -> {
            data.setValeur(updated.getValeur());
            data.setDescription(updated.getDescription());
            data.setActif(updated.getActif());
            ReferenceData saved = referenceDataRepository.save(data);
            auditService.logCurrentAction("UPDATE_REFERENCE", "ReferenceData",
                id.toString(), null,
                "Modification " + saved.getType() + ": " + saved.getValeur());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("${api.prefix.admin:/api/v1/admin}/reference/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return referenceDataRepository.findById(id).map(data -> {
            referenceDataRepository.delete(data);
            auditService.logCurrentAction("DELETE_REFERENCE", "ReferenceData",
                id.toString(), data.getValeur(),
                "Suppression " + data.getType() + ": " + data.getValeur());
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("${api.prefix.admin:/api/v1/admin}/reference/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        return referenceDataRepository.findById(id).map(data -> {
            data.setActif(!Boolean.TRUE.equals(data.getActif()));
            referenceDataRepository.save(data);
            return ResponseEntity.ok(Map.of("actif", data.getActif()));
        }).orElse(ResponseEntity.notFound().build());
    }
}
