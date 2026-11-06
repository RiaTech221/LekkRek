package com.lekkrek.scheduler;

/**
 * ============================================================================
 * 📁 Fichier : MenuScheduler.java
 * 📝 Description : Tâche planifiée pour basculer automatiquement les offres du jour en EPUISE.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot (module Offres / Automatisation).
 * 💡 Bascule les offres du jour (table 'offres') à 15h (dejeuner) et 23h (diner).
 * ============================================================================
 */

import com.lekkrek.entity.Offre;
import com.lekkrek.repository.OffreRepository;
import com.lekkrek.service.AuditService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Component
public class MenuScheduler {

    private final OffreRepository offreRepository;
    private final AuditService auditService;

    private static final ZoneId DAKAR_ZONE = ZoneId.of("Africa/Dakar");

    public MenuScheduler(OffreRepository offreRepository, AuditService auditService) {
        this.offreRepository = offreRepository;
        this.auditService = auditService;
    }

    /**
     * Cron Job: Tous les jours à 15h00 (Bascule automatique des offres du déjeuner)
     */
    @Scheduled(cron = "0 0 15 * * *", zone = "Africa/Dakar")
    public void archiverOffresMidi() {
        System.out.println("[CRON] 15:00 - Bascule automatique des offres du déjeuner en ÉPUISÉ.");
        desactiverOffresParMoment("dejeuner");
    }

    /**
     * Cron Job: Tous les jours à 23h00 (Bascule automatique des offres du dîner)
     */
    @Scheduled(cron = "0 0 23 * * *", zone = "Africa/Dakar")
    public void archiverOffresSoir() {
        System.out.println("[CRON] 23:00 - Bascule automatique des offres du dîner en ÉPUISÉ.");
        desactiverOffresParMoment("diner");
    }

    private void desactiverOffresParMoment(String moment) {
        LocalDate today = LocalDate.now(DAKAR_ZONE);
        List<Offre> offres = offreRepository.findByDateOffreAndMomentAndStatut(today, moment, "DISPO");
        for (Offre o : offres) {
            o.setStatut("EPUISE");
            offreRepository.save(o);
            auditService.logAction(
                    "system@lekkrek.com",
                    "ROLE_SYSTEM",
                    "AUTO_DEACTIVATE",
                    "Offre",
                    o.getId().toString(),
                    "DISPO",
                    "EPUISE"
            );
        }
        System.out.println("[CRON] " + offres.size() + " offre(s) du moment '" + moment + "' passée(s) en ÉPUISÉ.");
    }
}
