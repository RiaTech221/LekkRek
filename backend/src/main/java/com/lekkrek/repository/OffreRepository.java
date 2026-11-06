package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : OffreRepository.java
 * 📝 Description : Repository Spring Data JPA pour les offres datées.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * ============================================================================
 */

import com.lekkrek.entity.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OffreRepository extends JpaRepository<Offre, Long> {

    @Query("SELECT o FROM Offre o " +
           "JOIN o.restaurant r " +
           "JOIN o.plat p " +
           "WHERE o.dateOffre = :dateOffre " +
           "AND o.statut = 'DISPO' " +
           "AND o.prix > 0 " +
           "AND r.active = true")
    List<Offre> findActiveTodayOffers(@Param("dateOffre") LocalDate dateOffre);

    List<Offre> findByDateOffreAndMomentAndStatut(LocalDate dateOffre, String moment, String statut);

    List<Offre> findByRestaurantIdAndDateOffre(Long restaurantId, LocalDate dateOffre);

    boolean existsByRestaurantIdAndDateOffre(Long restaurantId, LocalDate dateOffre);
}
