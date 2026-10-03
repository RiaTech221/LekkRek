package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : PlatService.java
 * 📝 Description : Classe métier pour la gestion de PlatService dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Plat;
import com.lekkrek.dto.PlatRequestDTO;

import java.util.List;

public interface PlatService {
    List<Plat> getAllPlats();
    Plat createPlat(PlatRequestDTO request);
    Plat updatePlat(Long id, PlatRequestDTO request);
    void deletePlat(Long id);
    void duplicateYesterdayPlats(Long restaurantId);
    Plat updatePlatStatus(Long id, String status);
}
