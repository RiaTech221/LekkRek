-- ============================================================================
-- 📁 Fichier : database_schema.sql
-- 📝 Description : Schéma relationnel complet et données initiales pour LekkRek
-- 🔒 SGBD : MySQL 8.x (UTF-8 MB4)
-- 🛡️ Synchronisé fidèlement avec les 10 entités JPA du backend Spring Boot
-- ============================================================================

CREATE DATABASE IF NOT EXISTS lekkrek_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lekkrek_db;

-- ----------------------------------------------------------------------------
-- 1. Table des Utilisateurs (Administrateurs & Opérateurs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, OPERATEUR
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    photo_url VARCHAR(255),
    restaurant_assigne VARCHAR(255),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table des Restaurants (Partenaires)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    operator_name VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    subscription_plan VARCHAR(100) DEFAULT 'Basic',
    subscription_end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table des Plats (Menu)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'DISPO', -- DISPO, EPUISE
    moment VARCHAR(50), -- petit_dej, dejeuner, diner, fastfood, gouter
    variantes VARCHAR(255), -- synonymes / mots-clés de recherche séparés par virgules
    restaurant_id BIGINT NOT NULL,
    CONSTRAINT fk_plat_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table des Commandes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commandes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE, -- ex: CMD-123456
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(9) NOT NULL,
        CONSTRAINT chk_client_phone CHECK (client_phone REGEXP '^(77|78|76|75|70|33)[0-9]{7}$'),
    client_address VARCHAR(200),
    type VARCHAR(50) NOT NULL DEFAULT 'LIVRAISON', -- LIVRAISON, EMPORTER, SUR_PLACE
    status VARCHAR(50) NOT NULL DEFAULT 'NOUVELLE', -- NOUVELLE, EN_PREPARATION, PRETE, LIVREE, ANNULEE
    payment_method VARCHAR(50) NOT NULL, -- WAVE, ORANGE_MONEY, SAMIR_PAY, ESPECES
    payment_status VARCHAR(50) NOT NULL DEFAULT 'ATTENTE', -- ATTENTE, PAYE, ECHOUE
    total_amount DECIMAL(10,2) NOT NULL,
    restaurant_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_commande_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table des Articles de Commande (Commande_Items)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commande_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    commande_id BIGINT NOT NULL,
    plat_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_commande FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_plat FOREIGN KEY (plat_id) REFERENCES plats(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table des Demandes Partenaires (Devenir Partenaire)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_restaurant VARCHAR(255) NOT NULL,
    nom_contact VARCHAR(255) NOT NULL,
    telephone VARCHAR(9) NOT NULL,
        CONSTRAINT chk_partner_telephone CHECK (telephone REGEXP '^(77|78|76|75|70|33)[0-9]{7}$'),
    ville VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table des Contenus de Pages Statiques (CMS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_contents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE, -- about, terms, privacy, etc.
    title VARCHAR(255) NOT NULL,
    seo_keywords VARCHAR(255),
    content LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table des Paramètres Globaux de la Plateforme
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_settings (
    id BIGINT PRIMARY KEY, -- Toujours 1 (configuration globale unique)
    platform_name VARCHAR(255) NOT NULL,
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    default_currency VARCHAR(20) NOT NULL DEFAULT 'FCFA',
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    tiktok_url VARCHAR(255),
    whatsapp_message_greeting TEXT,
    whatsapp_message_cart TEXT,
    whatsapp_message_order TEXT,
    whatsapp_message_default TEXT,
    hero_title TEXT,
    hero_subtitle TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Table des Événements Analytics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- click_whatsapp, click_phone, search, view_offer
    entity_id VARCHAR(255),
    context TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Table du Journal d'Audit (Administration)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_email VARCHAR(255),
    role VARCHAR(50),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DEACTIVATE, PUBLISH
    entity_type VARCHAR(100) NOT NULL, -- Restaurant, Plat, Offre, Commande, etc.
    entity_id VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. Table des Données de Référence (Quartiers, Créneaux, Catégories) - SOL-192/193
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reference_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- QUARTIER, CRENEAU, CATEGORIE
    valeur VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_type_valeur (type, valeur)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créneaux par défaut
INSERT IGNORE INTO reference_data (type, valeur, description) VALUES
  ('CRENEAU', 'petit_dej', 'Petit-déjeuner (matin)'),
  ('CRENEAU', 'dejeuner', 'Déjeuner (midi)'),
  ('CRENEAU', 'gouter', 'Goûter (après-midi)'),
  ('CRENEAU', 'diner', 'Dîner (soir)'),
  ('CRENEAU', 'fastfood', 'Fast-food (toute la journée)');

-- Quartiers par défaut (Ziguinchor)
INSERT IGNORE INTO reference_data (type, valeur, description) VALUES
  ('QUARTIER', 'Boucotte', 'Quartier Boucotte'),
  ('QUARTIER', 'Kandialang', 'Quartier Kandialang'),
  ('QUARTIER', 'Lyndiane', 'Quartier Lyndiane'),
  ('QUARTIER', 'Tilène', 'Quartier Tilène'),
  ('QUARTIER', 'Santhiaba', 'Quartier Santhiaba'),
  ('QUARTIER', 'Kansanar', 'Quartier Kansanar'),
  ('QUARTIER', 'Colobane', 'Quartier Colobane');

-- Catégories par défaut
INSERT IGNORE INTO reference_data (type, valeur, description) VALUES
  ('CATEGORIE', 'Plats locaux', 'Cuisine locale sénégalaise'),
  ('CATEGORIE', 'Riz', 'Plats à base de riz'),
  ('CATEGORIE', 'Sandwichs', 'Sandwichs et snacks'),
  ('CATEGORIE', 'Boissons', 'Boissons et jus'),
  ('CATEGORIE', 'Desserts', 'Desserts et pâtisseries'),
  ('CATEGORIE', 'Grillades', 'Viandes et poissons grillés');



-- Administrateur initial (Mot de passe: password123)
INSERT INTO utilisateurs (nom_complet, email, mot_de_passe, role, actif) 
VALUES ('Administrateur', 'admin@lekkrek.com', '$2a$10$T2kP6.J6C6o6/L5G9Z5.uO/7.4.7/7/7/7/7.7/7/7/7/7/7', 'ADMIN', 1) 
ON DUPLICATE KEY UPDATE email=email;

-- Configuration globale par défaut (ID = 1)
INSERT INTO platform_settings (
    id,
    platform_name,
    support_email,
    support_phone,
    default_currency,
    whatsapp_message_greeting,
    whatsapp_message_cart,
    whatsapp_message_order,
    whatsapp_message_default,
    hero_title,
    hero_subtitle
) VALUES (
    1,
    'Lekk Rek',
    'contact@lekkrek.com',
    '770000000',
    'FCFA',
    'Bonjour l\'équipe LekkRek 👋, ',
    'J\'ai actuellement {count} plat(s) dans mon panier pour un total de {total} FCFA et j\'aimerais avoir de l\'aide pour finaliser ma commande.',
    'Je vous contacte concernant ma commande N° {orderNumber}.',
    'j\'aimerais avoir de plus amples informations s\'il vous plaît.',
    'Les menus du jour à Ziguinchor.',
    'Qui cuisine quoi aujourd\'hui, à quel prix et où le trouver. Menus publiés du lundi au samedi dès 10H30.'
) ON DUPLICATE KEY UPDATE id=id;
