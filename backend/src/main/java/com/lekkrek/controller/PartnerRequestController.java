package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : PartnerRequestController.java
 * 📝 Description : Classe métier pour la gestion de PartnerRequestController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.PartnerRequest;
import com.lekkrek.repository.PartnerRequestRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class PartnerRequestController {

    private final PartnerRequestRepository repository;

    public PartnerRequestController(PartnerRequestRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/api/v1/public/partner-requests")
    public PartnerRequest createRequest(@Valid @RequestBody PartnerRequest request) {
        request.setTelephone(com.lekkrek.util.PhoneNumberUtil.normalize(request.getTelephone()));
        return repository.save(request);
    }

    @GetMapping("/api/v1/admin/partner-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PartnerRequest> getRequests() {
        return repository.findAll();
    }
    
    @PutMapping("/api/v1/admin/partner-requests/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public PartnerRequest updateStatus(@PathVariable Long id, @RequestParam String status) {
        PartnerRequest req = repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        req.setStatus(status);
        return repository.save(req);
    }
}
