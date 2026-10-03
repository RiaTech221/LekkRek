package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : RestaurantRepository.java
 * 📝 Description : Classe métier pour la gestion de RestaurantRepository dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
}
