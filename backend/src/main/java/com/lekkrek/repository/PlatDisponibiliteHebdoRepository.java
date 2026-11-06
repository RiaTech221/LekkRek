package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : PlatDisponibiliteHebdoRepository.java
 * 📝 Description : Repository Spring Data JPA pour les disponibilités hebdomadaires.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * ============================================================================
 */

import com.lekkrek.entity.PlatDisponibiliteHebdo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlatDisponibiliteHebdoRepository extends JpaRepository<PlatDisponibiliteHebdo, Long> {

    List<PlatDisponibiliteHebdo> findByJourSemaineAndActifTrue(String jourSemaine);

    @Query("SELECT pdh FROM PlatDisponibiliteHebdo pdh " +
           "JOIN pdh.plat p " +
           "JOIN p.restaurant r " +
           "WHERE r.id = :restaurantId AND pdh.jourSemaine = :jourSemaine AND pdh.actif = true AND r.active = true")
    List<PlatDisponibiliteHebdo> findActiveByRestaurantAndDay(@Param("restaurantId") Long restaurantId, @Param("jourSemaine") String jourSemaine);

    @Query("SELECT pdh FROM PlatDisponibiliteHebdo pdh " +
           "JOIN pdh.plat p " +
           "JOIN p.restaurant r " +
           "WHERE pdh.jourSemaine = :jourSemaine AND pdh.actif = true AND r.active = true AND p.status = 'DISPO' AND p.price > 0")
    List<PlatDisponibiliteHebdo> findAllActiveForDay(@Param("jourSemaine") String jourSemaine);

    List<PlatDisponibiliteHebdo> findByPlatId(Long platId);
}
