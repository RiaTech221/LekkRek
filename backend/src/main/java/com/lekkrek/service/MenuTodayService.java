package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : MenuTodayService.java
 * 📝 Description : Service pour la récupération des offres et plats du jour.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot (Logique Métier).
 * ============================================================================
 */

import com.lekkrek.dto.PlatTodayDTO;
import java.util.List;

public interface MenuTodayService {
    List<PlatTodayDTO> getMenuToday();
}
