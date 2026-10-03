package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : AuditLogController.java
 * 📝 Description : Classe métier pour la gestion de AuditLogController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.AuditLog;
import com.lekkrek.repository.AuditLogRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix.admin:/api/v1/admin}/audit")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
