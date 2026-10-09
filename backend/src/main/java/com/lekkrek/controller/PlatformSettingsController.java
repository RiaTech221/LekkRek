package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : PlatformSettingsController.java
 * 📝 Description : Classe métier pour la gestion de PlatformSettingsController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.PlatformSettings;
import com.lekkrek.service.PlatformSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class PlatformSettingsController {

    private final PlatformSettingsService service;
    private final com.lekkrek.service.AuditService auditService;

    // Public : pour que la vitrine puisse afficher les liens sociaux et le tel
    @GetMapping
    public ResponseEntity<PlatformSettings> getSettings() {
        return ResponseEntity.ok(service.getSettings());
    }

    // Protégé : Seul l'admin peut modifier
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSettings(@RequestBody PlatformSettings settings) {
        if (settings.getSupportPhone() != null && !settings.getSupportPhone().isBlank()) {
            if (!com.lekkrek.util.PhoneNumberUtil.isValid(settings.getSupportPhone())) {
                return ResponseEntity.badRequest().body("Le numéro de téléphone de support doit être un numéro sénégalais valide (ex: 771234567 ou +221 77 123 45 67).");
            }
            settings.setSupportPhone(com.lekkrek.util.PhoneNumberUtil.normalize(settings.getSupportPhone()));
        }
        PlatformSettings updated = service.updateSettings(settings);
        auditService.logCurrentAction("UPDATE_SETTINGS", "PlatformSettings", "1", null, "Mise à jour des paramètres de la plateforme");
        return ResponseEntity.ok(updated);
    }
}
