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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
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

    /**
     * Enregistre une action en extrayant automatiquement l'email et le rôle de l'utilisateur authentifié.
     */
    public void logCurrentAction(String action, String entityType, String entityId, String oldValue, String newValue) {
        String actorEmail = "system";
        String role = "ADMIN";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            actorEmail = auth.getName();
            role = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ADMIN");
        }

        AuditLog log = new AuditLog(actorEmail, role, action, entityType, entityId, oldValue, newValue);
        auditLogRepository.save(log);
    }
}
