package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : ReferenceDataRepository.java
 * 📝 Description : Repository JPA pour ReferenceData (Quartiers/Créneaux/Catégories)
 * 🔒 Rôle : Accès données - SOL-192 / SOL-193
 * ============================================================================
 */

import com.lekkrek.entity.ReferenceData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReferenceDataRepository extends JpaRepository<ReferenceData, Long> {
    List<ReferenceData> findByTypeOrderByValeurAsc(ReferenceData.Type type);
    List<ReferenceData> findByTypeAndActifTrueOrderByValeurAsc(ReferenceData.Type type);
    boolean existsByTypeAndValeur(ReferenceData.Type type, String valeur);
}
