package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : CommandeRepository.java
 * 📝 Description : Classe métier pour la gestion de CommandeRepository dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
    Optional<Commande> findByOrderNumber(String orderNumber);
}
