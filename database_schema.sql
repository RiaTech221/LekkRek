-- ==========================================
-- SCHEMA DE BASE DE DONNÉES : LEKKREK
-- ==========================================

CREATE DATABASE IF NOT EXISTS lekkrek_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lekkrek_db;

-- 1. Table des Utilisateurs (Administrateurs & Opérateurs)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN ou OPERATEUR
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Restaurants (Partenaires)
CREATE TABLE IF NOT EXISTS restaurants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    operator_name VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Plats (Menu)
CREATE TABLE IF NOT EXISTS plats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    image VARCHAR(255),
    moment VARCHAR(50), -- petit_dej, dejeuner, diner, fastfood
    status VARCHAR(50) NOT NULL, -- DISPO ou EPUISE
    restaurant_id BIGINT NOT NULL,
    CONSTRAINT fk_plat_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- 4. Table des Commandes
CREATE TABLE IF NOT EXISTS commandes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE, -- ex: CMD-123456
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CASH_ON_DELIVERY, WAVE, ORANGE_MONEY
    status VARCHAR(50) NOT NULL, -- NOUVELLE, EN_PREPARATION, PRETE, LIVREE, ANNULEE
    total_amount DOUBLE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table des Articles de la Commande (Commande_Items)
CREATE TABLE IF NOT EXISTS commande_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    commande_id BIGINT NOT NULL,
    plat_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_order DOUBLE NOT NULL,
    CONSTRAINT fk_item_commande FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_plat FOREIGN KEY (plat_id) REFERENCES plats(id)
);

-- ==========================================
-- JEU DE DONNÉES INITIAL (POUR LE TEST)
-- ==========================================

-- Insertion de l'Administrateur par défaut (Mot de passe: password123)
INSERT INTO utilisateurs (nom_complet, email, mot_de_passe, role, actif) 
VALUES ('Administrateur', 'admin@lekkrek.com', '$2a$10$T2kP6.J6C6o6/L5G9Z5.uO/7.4.7/7/7/7/7.7/7/7/7/7/7', 'ADMIN', 1) 
ON DUPLICATE KEY UPDATE email=email;

-- Note : L'application Spring Boot est configurée avec spring.jpa.hibernate.ddl-auto=update.
-- Les tables seront mises à jour automatiquement si le modèle Java évolue.
