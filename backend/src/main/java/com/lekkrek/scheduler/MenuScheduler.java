package com.lekkrek.scheduler;

import com.lekkrek.entity.Plat;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.service.AuditService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MenuScheduler {

    private final PlatRepository platRepository;
    private final AuditService auditService;

    public MenuScheduler(PlatRepository platRepository, AuditService auditService) {
        this.platRepository = platRepository;
        this.auditService = auditService;
    }

    /**
     * Cron Job: Tous les jours à 15h00 (Bascule automatique des plats du midi)
     * Format Cron: Seconde Minute Heure Jour Mois Jour_de_la_semaine
     */
    @Scheduled(cron = "0 0 15 * * *")
    public void archiverPlatsMidi() {
        System.out.println("[CRON] 15:00 - Désactivation automatique des plats du déjeuner.");
        desactiverPlatsParMoment("dejeuner");
    }

    /**
     * Cron Job: Tous les jours à 23h00 (Bascule automatique des plats du soir)
     */
    @Scheduled(cron = "0 0 23 * * *")
    public void archiverPlatsSoir() {
        System.out.println("[CRON] 23:00 - Désactivation automatique des plats du dîner.");
        desactiverPlatsParMoment("diner");
    }

    private void desactiverPlatsParMoment(String moment) {
        List<Plat> plats = platRepository.findAll();
        for (Plat p : plats) {
            if (moment.equalsIgnoreCase(p.getMoment()) && Plat.DishStatus.DISPO.equals(p.getStatus())) {
                p.setStatus(Plat.DishStatus.EPUISE);
                platRepository.save(p);
                auditService.logAction(
                        "system@lekkrek.com", 
                        "ROLE_SYSTEM", 
                        "AUTO_DEACTIVATE", 
                        "Plat", 
                        p.getId().toString(), 
                        "DISPO", 
                        "EPUISE"
                );
            }
        }
    }
}
