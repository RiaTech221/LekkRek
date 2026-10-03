package com.lekkrek.service.impl;

/**
 * ============================================================================
 * 📁 Fichier : PlatServiceImpl.java
 * 📝 Description : Classe métier pour la gestion de PlatServiceImpl dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.dto.PlatRequestDTO;
import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.service.PlatService;
import com.lekkrek.service.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.List;

@Service
public class PlatServiceImpl implements PlatService {

    private final PlatRepository platRepository;
    private final RestaurantRepository restaurantRepository;
    private final AuditService auditService;

    public PlatServiceImpl(PlatRepository platRepository, RestaurantRepository restaurantRepository, AuditService auditService) {
        this.platRepository = platRepository;
        this.restaurantRepository = restaurantRepository;
        this.auditService = auditService;
    }

    @Override
    public List<Plat> getAllPlats() {
        return platRepository.findAll();
    }

    @Override
    public Plat createPlat(PlatRequestDTO request) {
        Restaurant restaurant = restaurantRepository.findById(request.restaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        Plat plat = new Plat();
        plat.setName(request.name());
        plat.setDescription(request.description());
        plat.setPrice(request.price());
        plat.setImage(request.image());
        plat.setMoment(request.moment());
        plat.setVariantes(request.variantes());
        plat.setStatus(Plat.DishStatus.valueOf(request.status()));
        plat.setRestaurant(restaurant);

        return platRepository.save(plat);
    }

    @Override
    public Plat updatePlat(Long id, PlatRequestDTO request) {
        Plat plat = platRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plat non trouvé"));

        Restaurant restaurant = restaurantRepository.findById(request.restaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        plat.setName(request.name());
        plat.setDescription(request.description());
        plat.setPrice(request.price());
        plat.setImage(request.image());
        plat.setMoment(request.moment());
        plat.setVariantes(request.variantes());
        plat.setStatus(Plat.DishStatus.valueOf(request.status()));
        plat.setRestaurant(restaurant);

        return platRepository.save(plat);
    }

    @Override
    public void deletePlat(Long id) {
        platRepository.deleteById(id);
    }

    @Override
    public Plat updatePlatStatus(Long id, String status) {
        Plat plat = platRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plat non trouvé"));
        plat.setStatus(Plat.DishStatus.valueOf(status));
        return platRepository.save(plat);
    }
}
