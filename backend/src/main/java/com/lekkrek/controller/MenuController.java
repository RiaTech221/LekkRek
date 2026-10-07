package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : MenuController.java
 * 📝 Description : Classe métier pour la gestion de MenuController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Plat;
import com.lekkrek.repository.PlatRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix.public:/api/v1/public}/menu")
public class MenuController {

    private final PlatRepository platRepository;

    public MenuController(PlatRepository platRepository) {
        this.platRepository = platRepository;
    }

        @GetMapping
    public List<Plat> searchPlats(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String resto,
            @RequestParam(required = false) java.math.BigDecimal budgetMax,
            @RequestParam(required = false) String quartier,
            @RequestParam(required = false) String moment) {
        
        // Le dictionnaire en dur a été retiré. La recherche utilise désormais le champ "variantes" 
        // de la base de données, permettant aux opérateurs de gérer les synonymes depuis l'interface (conformément au Cahier des Charges).
        keyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        resto = (resto != null && !resto.isBlank()) ? resto : null;
        quartier = (quartier != null && !quartier.isBlank()) ? quartier : null;
        moment = (moment != null && !moment.isBlank()) ? moment : null;

        return platRepository.searchPlats(keyword, resto, budgetMax, quartier, moment);
    }

    @GetMapping("/recommendations")
    public List<Plat> getRecommendations(@RequestParam(required = false) String phone) {
        org.springframework.data.domain.Pageable top4 = org.springframework.data.domain.PageRequest.of(0, 4);
        
        if (phone != null && !phone.isBlank()) {
            String cleanPhone = com.lekkrek.util.PhoneNumberUtil.normalize(phone);
            List<Plat> recommended = platRepository.findMostOrderedByPhone(cleanPhone, top4);
            if (!recommended.isEmpty()) {
                return recommended;
            }
        }
        
        // Fallback: les plats les plus populaires globalement
        return platRepository.findPopularPlats(top4);
    }
}
