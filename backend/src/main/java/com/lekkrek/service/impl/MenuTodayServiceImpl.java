package com.lekkrek.service.impl;

/**
 * ============================================================================
 * 📁 Fichier : MenuTodayServiceImpl.java
 * 📝 Description : Implémentation du service des plats du jour avec logique de fallback.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot (Logique Métier).
 * ============================================================================
 */

import com.lekkrek.dto.PlatTodayDTO;
import com.lekkrek.entity.Offre;
import com.lekkrek.entity.Plat;
import com.lekkrek.entity.PlatDisponibiliteHebdo;
import com.lekkrek.repository.OffreRepository;
import com.lekkrek.repository.PlatDisponibiliteHebdoRepository;
import com.lekkrek.service.MenuTodayService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuTodayServiceImpl implements MenuTodayService {

    private final OffreRepository offreRepository;
    private final PlatDisponibiliteHebdoRepository platDisponibiliteHebdoRepository;

    private static final ZoneId DAKAR_ZONE = ZoneId.of("Africa/Dakar");

    @Override
    public List<PlatTodayDTO> getMenuToday() {
        LocalDate today = LocalDate.now(DAKAR_ZONE);
        String jourSemaine = toFrenchDayOfWeek(today.getDayOfWeek());

        List<PlatTodayDTO> results = new ArrayList<>();

        // 1. Offres datées du jour (statut DISPO, restaurant actif)
        List<Offre> todayOffers = offreRepository.findActiveTodayOffers(today);

        Set<Long> restaurantsWithOffers = new HashSet<>();

        for (Offre o : todayOffers) {
            if (o.getPrix() != null && o.getPrix().compareTo(BigDecimal.ZERO) > 0 && o.getPlat() != null) {
                if (o.getRestaurant() != null) {
                    restaurantsWithOffers.add(o.getRestaurant().getId());
                }
                results.add(PlatTodayDTO.builder()
                        .id(o.getPlat().getId())
                        .platId(o.getPlat().getId())
                        .offreId(o.getId())
                        .name(o.getPlat().getName())
                        .description(o.getPlat().getDescription())
                        .price(o.getPrix())
                        .prixEmporter(o.getPrixEmporter())
                        .image(o.getPlat().getImage())
                        .status("DISPO")
                        .moment(o.getMoment())
                        .isOffreSpeciale(true)
                        .restaurant(o.getRestaurant())
                        .build());
            }
        }

        // 2. Fallback sur la grille hebdomadaire pour les restaurants actifs sans offre datée aujourd'hui
        List<PlatDisponibiliteHebdo> hebdoList = platDisponibiliteHebdoRepository.findAllActiveForDay(jourSemaine);

        for (PlatDisponibiliteHebdo pdh : hebdoList) {
            Plat p = pdh.getPlat();
            if (p != null && p.getRestaurant() != null) {
                Long restoId = p.getRestaurant().getId();
                // N'inclure que si le restaurant n'a aucune offre datée ce jour-là
                if (!restaurantsWithOffers.contains(restoId)) {
                    if (p.getPrice() != null && p.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                        results.add(PlatTodayDTO.builder()
                                .id(p.getId())
                                .platId(p.getId())
                                .offreId(null)
                                .name(p.getName())
                                .description(p.getDescription())
                                .price(p.getPrice())
                                .prixEmporter(null)
                                .image(p.getImage())
                                .status("DISPO")
                                .moment(pdh.getMoment() != null ? pdh.getMoment() : p.getMoment())
                                .isOffreSpeciale(false)
                                .restaurant(p.getRestaurant())
                                .build());
                    }
                }
            }
        }

        // Filtre de sécurité absolu : ne jamais exposer une ligne sans prix ou avec prix <= 0
        return results.stream()
                .filter(dto -> dto.getPrice() != null && dto.getPrice().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());
    }

    private String toFrenchDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "LUNDI";
            case TUESDAY -> "MARDI";
            case WEDNESDAY -> "MERCREDI";
            case THURSDAY -> "JEUDI";
            case FRIDAY -> "VENDREDI";
            case SATURDAY -> "SAMEDI";
            case SUNDAY -> "DIMANCHE";
        };
    }
}
