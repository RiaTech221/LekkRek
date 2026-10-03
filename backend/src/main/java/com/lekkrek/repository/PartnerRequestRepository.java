package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : PartnerRequestRepository.java
 * 📝 Description : Classe métier pour la gestion de PartnerRequestRepository dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.PartnerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerRequestRepository extends JpaRepository<PartnerRequest, Long> {
}
