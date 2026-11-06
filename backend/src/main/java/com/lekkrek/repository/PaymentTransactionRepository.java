package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : PaymentTransactionRepository.java
 * 📝 Description : Repository JPA pour la gestion des transactions PayTech.
 * 🔒 Rôle : Accès aux données de PaymentTransaction.
 * ============================================================================
 */

import com.lekkrek.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    /** Retrouver une transaction par le token PayTech (utilisé lors de l'IPN) */
    Optional<PaymentTransaction> findByPaytechToken(String paytechToken);

    /** Retrouver toutes les transactions d'une commande */
    List<PaymentTransaction> findByOrderNumberOrderByCreatedAtDesc(String orderNumber);
}
