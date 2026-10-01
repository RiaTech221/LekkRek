package com.lekkrek.repository;

import com.lekkrek.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
    Optional<Commande> findByOrderNumber(String orderNumber);
}
