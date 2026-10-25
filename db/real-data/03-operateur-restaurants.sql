-- 03 — Migration LekkRek (MySQL 8) : assignation opérateur ↔ restaurants (0..n)
-- Script de migration pour la production. Ne pas exécuter directement en dev (géré par JPA / insertion manuelle).

CREATE TABLE IF NOT EXISTS operateur_restaurants (
  utilisateur_id BIGINT NOT NULL,
  restaurant_id BIGINT NOT NULL,
  PRIMARY KEY (utilisateur_id, restaurant_id),
  CONSTRAINT fk_op_resto_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  CONSTRAINT fk_op_resto_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_op_resto_utilisateur (utilisateur_id),
  INDEX idx_op_resto_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration des données existantes :
-- Pour chaque utilisateur avec restaurant_assigne renseigné, insertion de la liaison
-- en retrouvant le restaurant par nom (comparaison normalisée : trim, insensible à la casse et aux accents).
INSERT IGNORE INTO operateur_restaurants (utilisateur_id, restaurant_id)
SELECT u.id, r.id
FROM utilisateurs u
JOIN restaurants r ON LOWER(TRIM(u.restaurant_assigne)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(r.name)) COLLATE utf8mb4_unicode_ci
WHERE u.restaurant_assigne IS NOT NULL 
  AND TRIM(u.restaurant_assigne) != '';
