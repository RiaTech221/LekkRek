-- ============================================================================
-- 📁 Fichier : V002__create_payment_transactions.sql
-- 📝 Description : Création de la table payment_transactions pour tracer
--                 les paiements PayTech (Wave, Orange Money, CB, etc.)
-- 🔒 Compatible avec Hibernate ddl-auto=update (optionnel en dev)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number    VARCHAR(255)   NOT NULL,
    paytech_token   VARCHAR(255)   UNIQUE,
    redirect_url    VARCHAR(1024),
    amount          DECIMAL(12, 2) NOT NULL,
    currency        VARCHAR(10)    DEFAULT 'XOF',
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    ipn_payload     TEXT,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME,

    INDEX idx_payment_order_number (order_number),
    INDEX idx_payment_status (status),
    INDEX idx_payment_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
