package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : PaymentTransaction.java
 * 📝 Description : Entité JPA pour tracer chaque tentative de paiement via PayTech.
 * 🔒 Rôle : Enregistre l'état de chaque transaction (initiation + IPN PayTech).
 * 💡 Auteur : LekkRek Backend — Paiement PayTech
 * ============================================================================
 */

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
@NoArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Référence de la commande LekkRek (ex: CMD-XXXXXXXX), lien logique vers Commande */
    @Column(nullable = false)
    private String orderNumber;

    /** Token retourné par PayTech lors de l'initiation du paiement */
    @Column(unique = true)
    private String paytechToken;

    /** URL de redirection PayTech fournie au client */
    @Column(length = 1024)
    private String redirectUrl;

    /** Montant de la transaction en centimes XOF */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /** Devise (par défaut XOF) */
    @Column(length = 10)
    private String currency = "XOF";

    /** État courant de la transaction */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;

    /** Payload brut reçu lors de la notification IPN PayTech (stocké pour audit) */
    @Column(columnDefinition = "TEXT")
    private String ipnPayload;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum TransactionStatus {
        /** Paiement initié, en attente de confirmation IPN */
        PENDING,
        /** Paiement confirmé (IPN type_event = sale_complete) */
        COMPLETED,
        /** Paiement annulé par le client */
        CANCELLED,
        /** Paiement échoué */
        FAILED
    }
}
