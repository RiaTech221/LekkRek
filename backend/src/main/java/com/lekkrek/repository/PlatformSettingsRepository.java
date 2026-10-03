package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : PlatformSettingsRepository.java
 * 📝 Description : Classe métier pour la gestion de PlatformSettingsRepository dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, Long> {
}
