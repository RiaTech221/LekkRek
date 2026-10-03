package com.lekkrek.controller;

import com.lekkrek.entity.PlatformSettings;
import com.lekkrek.service.PlatformSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PlatformSettingsController {

    private final PlatformSettingsService service;

    // Public : pour que la vitrine puisse afficher les liens sociaux et le tel
    @GetMapping
    public ResponseEntity<PlatformSettings> getSettings() {
        return ResponseEntity.ok(service.getSettings());
    }

    // Protégé : Seul l'admin peut modifier
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlatformSettings> updateSettings(@RequestBody PlatformSettings settings) {
        return ResponseEntity.ok(service.updateSettings(settings));
    }
}
