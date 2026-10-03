package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : AuditLogRepository.java
 * 📝 Description : Classe métier pour la gestion de AuditLogRepository dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByTimestampDesc();
}
