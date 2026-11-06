-- 01 — Migration LekkRek (MySQL 8) : champs et tables manquants
-- À lancer AVANT le seed. En dev, Hibernate (ddl-auto=update) créera les colonnes
-- si tu ajoutes les champs dans les entités ; ce script sert pour la prod (validate).

ALTER TABLE restaurants
  ADD COLUMN repere VARCHAR(255) NULL,
  ADD COLUMN sur_place BOOLEAN NULL,
  ADD COLUMN a_emporter BOOLEAN NULL,
  ADD COLUMN livraison BOOLEAN NULL,
  ADD COLUMN supplement_livraison DECIMAL(10,2) NULL,
  ADD COLUMN notes VARCHAR(500) NULL;

CREATE TABLE plat_disponibilites_hebdo (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  plat_id BIGINT NOT NULL,
  jour_semaine VARCHAR(10) NOT NULL,   -- LUNDI..DIMANCHE
  moment VARCHAR(50) NOT NULL DEFAULT 'dejeuner',
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_dispo_plat FOREIGN KEY (plat_id) REFERENCES plats(id) ON DELETE CASCADE,
  UNIQUE (plat_id, jour_semaine, moment)
);

-- Offres datées : sert à la fois pour "plat du jour" ET pour l'historique (dates passées).
CREATE TABLE offres (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id BIGINT NOT NULL,
  plat_id BIGINT NOT NULL,
  date_offre DATE NOT NULL,
  moment VARCHAR(50) NOT NULL,
  prix DECIMAL(10,2) NOT NULL CHECK (prix > 0),
  prix_emporter DECIMAL(10,2) NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'DISPO',   -- DISPO | EPUISE
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_offre_resto FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT fk_offre_plat FOREIGN KEY (plat_id) REFERENCES plats(id) ON DELETE CASCADE,
  UNIQUE (plat_id, date_offre, moment),
  INDEX idx_offre_date (date_offre)
);
