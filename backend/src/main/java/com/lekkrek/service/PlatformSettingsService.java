package com.lekkrek.service;

import com.lekkrek.entity.PlatformSettings;
import com.lekkrek.repository.PlatformSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlatformSettingsService {

    private final PlatformSettingsRepository repository;

    public PlatformSettings getSettings() {
        return repository.findById(1L).orElseGet(() -> {
            // Paramètres par défaut si la base est vide
            return PlatformSettings.builder()
                    .id(1L)
                    .platformName("LekkRek")
                    .supportEmail("support@lekkrek.com")
                    .supportPhone("+221 77 000 00 00")
                    .defaultCurrency("FCFA")
                    .instagramUrl("lekkrek.sn")
                    .facebookUrl("lekkrekofficiel")
                    .tiktokUrl("lekkrek_food")
                    .build();
        });
    }

    @Transactional
    public PlatformSettings updateSettings(PlatformSettings newSettings) {
        newSettings.setId(1L); // S'assurer que l'ID est toujours 1
        return repository.save(newSettings);
    }
}
