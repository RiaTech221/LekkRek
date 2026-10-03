package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : AuditService.java
 * 📝 Description : Classe métier pour la gestion de AuditService dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.AuditLog;
import com.lekkrek.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String actorEmail, String role, String action, String entityType, String entityId, String oldValue, String newValue) {
        AuditLog log = new AuditLog(actorEmail, role, action, entityType, entityId, oldValue, newValue);
        auditLogRepository.save(log);
    }
}
