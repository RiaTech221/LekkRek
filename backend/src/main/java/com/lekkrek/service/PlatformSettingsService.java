package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : PlatformSettingsService.java
 * 📝 Description : Classe métier pour la gestion de PlatformSettingsService dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.PlatformSettings;
import com.lekkrek.repository.PlatformSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlatformSettingsService {

    private final PlatformSettingsRepository repository;

    /**
     * Vérifie si une chaîne contient des caractères de remplacement UTF-8 (encodage corrompu).
     */
    private boolean isCorrupted(String s) {
        return s != null && (s.contains("\uFFFD") || s.contains("\u00C3") || s.contains("\u00C2\u00B0"));
    }

    @Transactional
    public PlatformSettings getSettings() {
        PlatformSettings settings = repository.findById(1L).orElseGet(() ->
            PlatformSettings.builder()
                    .id(1L)
                    .platformName("LekkRek")
                    .supportEmail("support@lekkrek.com")
                    .supportPhone(null)
                    .defaultCurrency("FCFA")
                    .instagramUrl("lekkrek.sn")
                    .facebookUrl("lekkrekofficiel")
                    .tiktokUrl("lekkrek_food")
                    .whatsappMessageGreeting("Bonjour l'\u00e9quipe LekkRek \uD83D\uDC4B, ")
                    .whatsappMessageCart("J'ai actuellement {count} plat(s) dans mon panier pour un total de {total} FCFA et j'aimerais avoir de l'aide pour finaliser ma commande.")
                    .whatsappMessageOrder("Je vous contacte concernant ma commande N\u00b0 {orderNumber}.")
                    .whatsappMessageDefault("j'aimerais avoir de plus amples informations s'il vous pla\u00eet.")
                    .build()
        );

        // Auto-réparation : corrige les valeurs corrompues stockées en BDD
        boolean needsSave = false;

        if (isCorrupted(settings.getWhatsappMessageGreeting())) {
            settings.setWhatsappMessageGreeting("Bonjour l'\u00e9quipe LekkRek \uD83D\uDC4B, ");
            needsSave = true;
        }
        if (isCorrupted(settings.getWhatsappMessageOrder())) {
            settings.setWhatsappMessageOrder("Je vous contacte concernant ma commande N\u00b0 {orderNumber}.");
            needsSave = true;
        }
        if (isCorrupted(settings.getWhatsappMessageDefault())) {
            settings.setWhatsappMessageDefault("j'aimerais avoir de plus amples informations s'il vous pla\u00eet.");
            needsSave = true;
        }
        if (isCorrupted(settings.getWhatsappMessageCart())) {
            settings.setWhatsappMessageCart("J'ai actuellement {count} plat(s) dans mon panier pour un total de {total} FCFA et j'aimerais avoir de l'aide pour finaliser ma commande.");
            needsSave = true;
        }

        if (needsSave) {
            repository.save(settings);
        }

        return settings;
    }

    @Transactional
    public PlatformSettings updateSettings(PlatformSettings newSettings) {
        newSettings.setId(1L); // S'assurer que l'ID est toujours 1
        return repository.save(newSettings);
    }
}

