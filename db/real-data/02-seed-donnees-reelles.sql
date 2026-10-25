-- 02 — Seed des vraies données LekkRek (MySQL 8)
-- Source : Tableur de collecte (Les Studios du Sud). À lancer APRÈS 01-migration.
-- Pas d'ID en dur : tout se rattache par nom de restaurant / de plat.

-- ⚠️ DEV UNIQUEMENT — purge des données fictives (décommente si tu es sûr)
-- SET FOREIGN_KEY_CHECKS=0; DELETE FROM commande_items; DELETE FROM commandes; DELETE FROM plats; DELETE FROM restaurants; SET FOREIGN_KEY_CHECKS=1;
-- UPDATE utilisateurs SET restaurant_assigne=NULL WHERE role='OPERATEUR';

-- Quartiers réels
INSERT IGNORE INTO reference_data (type, valeur, actif) VALUES
  ('QUARTIER','Escale',TRUE),
  ('QUARTIER','Boucotte Centre',TRUE),
  ('QUARTIER','Marché Boucotte',TRUE),
  ('QUARTIER','HLM Néma',TRUE),
  ('QUARTIER','Peyrissac',TRUE),
  ('QUARTIER','Nema 2',TRUE),
  ('QUARTIER','Aéroport',TRUE),
  ('QUARTIER','UFR Santé',TRUE);

-- Restaurants
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Audace Restaurant', 'Escale', NULL, TRUE, 10.00, 'Basic', 'À côté de Rubis', TRUE, TRUE, FALSE, NULL, NULL);
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Chez Madame Sow', 'Peyrissac', '775359325', TRUE, 10.00, 'Basic', NULL, TRUE, FALSE, TRUE, 500, 'Soir uniquement');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Chez Raph', 'HLM Néma', '775919884', TRUE, 10.00, 'Basic', 'Route de l''hôpital régional', FALSE, TRUE, TRUE, 500, 'Carte fixe, street food');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Dibiterie de la Paix', 'Ziguinchor', NULL, TRUE, 10.00, 'Basic', 'À côté de l''hôpital de la Paix', NULL, NULL, NULL, NULL, NULL);
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('La Cuisine de Maya', 'Livraison uniquement', '771936929', TRUE, 10.00, 'Basic', NULL, FALSE, FALSE, TRUE, 500, NULL);
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('La Mariken', 'Boucotte Centre', '784763838', TRUE, 10.00, 'Basic', 'Avenue Émile Badiane', TRUE, TRUE, TRUE, 500, 'Service dès 13h');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Les Délices de Arame', 'Livraison uniquement', '772388072', TRUE, 10.00, 'Basic', NULL, FALSE, FALSE, TRUE, 500, 'Salé, sucré, box apéritif');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Restaurant Ajamat', 'Marché Boucotte', NULL, TRUE, 10.00, 'Basic', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Saveur de Bij', 'Escale', '787924444', TRUE, 10.00, 'Basic', 'Rond-point Jean-Paul II', TRUE, TRUE, FALSE, NULL, '2 000 F à emporter');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Signare', 'Ziguinchor', NULL, TRUE, 10.00, 'Basic', 'Route du lycée Djignabo', NULL, NULL, NULL, NULL, 'Vérifier si distinct de Signale');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Tonton G', 'Escale', '775842787', TRUE, 10.00, 'Basic', NULL, TRUE, TRUE, TRUE, 500, 'Midi, soir et petit déjeuner');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Vito Launch', 'Aéroport', NULL, TRUE, 10.00, 'Basic', 'Aéroport et UFR Santé', TRUE, FALSE, FALSE, NULL, 'Deux adresses');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Fast Food PAPA Seydou', 'Nema 2', NULL, FALSE, 10.00, 'Basic', 'Face camp militaire', NULL, NULL, NULL, NULL, 'Modes de service à confirmer');
INSERT INTO restaurants (name, location, telephone, active, commission_rate, subscription_plan, repere, sur_place, a_emporter, livraison, supplement_livraison, notes) VALUES ('Khadija face de auchan', 'Ziguinchor', NULL, TRUE, 10.00, 'Basic', NULL, NULL, NULL, NULL, NULL, 'Présent dans les listes, sans fiche');

-- Plats
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiéboudienne', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou yapp', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou guinaar', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Les Délices de Arame';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Vermicelle yapp', 2000, 'DISPO', 'diner', id FROM restaurants WHERE name='Chez Madame Sow';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Yassa poulet', 1500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Saveur de Bij';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Mafé yapp', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Soupou kandja', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Etodiaye', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiéboudienne bou xonk', 1000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Restaurant Ajamat';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou yapp', 1000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Dibiterie de la Paix';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Yassa poisson', 1500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Saveur de Bij';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Yassa poisson', 1500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Signare';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiéboudienne bou wekh', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Yassa', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Audace Restaurant';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou niébé', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Vito Launch';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou diagua', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Cuisine de Maya';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiou yapp', 1500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Signare';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Domoda crevette', 800, 'DISPO', 'diner', id FROM restaurants WHERE name='Chez Madame Sow';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou guinaar', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Caldou', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Mafé yapp', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Vito Launch';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Yassa guinaar', 1500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Khadija face de auchan';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Yassa guinaar', 1000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Dibiterie de la Paix';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'C''bon', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou yapp', 1700, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Saveur de Bij';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'C''bon', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Cuisine de Maya';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Fiteuf', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Yassa poulet', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Couscous', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Vermicelle', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou yapp', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou guinaar', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Caldou', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='La Mariken';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'C''bon', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Audace Restaurant';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Etodiaye', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Audace Restaurant';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiéboudienne', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Audace Restaurant';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Caldou', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Audace Restaurant';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Vermicelle', 2500, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Audace Restaurant';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiou yapp', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Etodiaye', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'C''bon', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiéboudienne', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Yassa guinaar', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiébou niébé yapp', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Mafé', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Mbakhal yapp', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Thiéboudienne bou xonk', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';
INSERT INTO plats (name, price, status, moment, restaurant_id) SELECT 'Soupe yell', 2000, 'DISPO', 'dejeuner', id FROM restaurants WHERE name='Tonton G';

-- Grilles hebdomadaires
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'LUNDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Yassa poulet';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MARDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Yassa poulet';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MERCREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Yassa poulet';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'JEUDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Yassa poulet';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'VENDREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Yassa poulet';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'SAMEDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Yassa poulet';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'DIMANCHE', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Yassa poulet';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'LUNDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Thiéboudienne';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MARDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Couscous';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MARDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Vermicelle';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MERCREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Mafé yapp';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'JEUDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Thiébou yapp';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'JEUDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Thiébou guinaar';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'VENDREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Etodiaye';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'SAMEDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='C''bon';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'DIMANCHE', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Caldou';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'LUNDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Audace Restaurant' AND p.name='Yassa';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MARDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Audace Restaurant' AND p.name='C''bon';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MERCREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Audace Restaurant' AND p.name='Etodiaye';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'JEUDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Audace Restaurant' AND p.name='Thiéboudienne';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'VENDREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Audace Restaurant' AND p.name='Caldou';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'SAMEDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Audace Restaurant' AND p.name='Vermicelle';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'LUNDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiéboudienne bou wekh';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'LUNDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiou yapp';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'LUNDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Caldou';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MARDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiébou yapp';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MARDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Etodiaye';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MARDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='C''bon';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MERCREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiéboudienne';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MERCREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Caldou';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'MERCREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Yassa guinaar';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'JEUDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiébou guinaar';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'JEUDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Soupou kandja';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'JEUDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Caldou';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'VENDREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiébou niébé yapp';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'VENDREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='C''bon';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'VENDREDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Mafé';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'SAMEDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiéboudienne bou wekh';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'SAMEDI', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Fiteuf';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'DIMANCHE', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Yassa guinaar';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'DIMANCHE', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Mbakhal yapp';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'DIMANCHE', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiéboudienne bou xonk';
INSERT IGNORE INTO plat_disponibilites_hebdo (plat_id, jour_semaine, moment) SELECT p.id, 'DIMANCHE', p.moment FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Soupe yell';

-- Offres datées (historique + collecte du 2026-10-13)
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-10', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Thiéboudienne';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-10', 'dejeuner', 2000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiébou yapp';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-11', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Les Délices de Arame' AND p.name='Thiébou guinaar';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-11', 'diner', 2000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Chez Madame Sow' AND p.name='Vermicelle yapp';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-12', 'dejeuner', 1500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Saveur de Bij' AND p.name='Yassa poulet';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-12', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Mafé yapp';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-13', 'dejeuner', 2000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Soupou kandja';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-14', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Etodiaye';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-15', 'dejeuner', 1000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Restaurant Ajamat' AND p.name='Thiéboudienne bou xonk';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-15', 'dejeuner', 1000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Dibiterie de la Paix' AND p.name='Thiébou yapp';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-17', 'dejeuner', 1500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Saveur de Bij' AND p.name='Yassa poisson';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-17', 'dejeuner', 1500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Signare' AND p.name='Yassa poisson';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-17', 'dejeuner', 2000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiéboudienne bou wekh';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-17', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='Thiéboudienne';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-17', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Audace Restaurant' AND p.name='Yassa';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-17', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Vito Launch' AND p.name='Thiébou niébé';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-08-17', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Cuisine de Maya' AND p.name='Thiébou diagua';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 1500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Signare' AND p.name='Thiou yapp';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'diner', 800, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Chez Madame Sow' AND p.name='Domoda crevette';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 2000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Thiébou guinaar';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 2000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Soupou kandja';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 2000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Caldou';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Vito Launch' AND p.name='Mafé yapp';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 1500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Khadija face de auchan' AND p.name='Yassa guinaar';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 1000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Dibiterie de la Paix' AND p.name='Yassa guinaar';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Mariken' AND p.name='C''bon';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 1700, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Saveur de Bij' AND p.name='Thiébou yapp';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 2500, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='La Cuisine de Maya' AND p.name='C''bon';
INSERT IGNORE INTO offres (restaurant_id, plat_id, date_offre, moment, prix, statut) SELECT r.id, p.id, '2026-10-13', 'dejeuner', 2000, 'DISPO' FROM plats p JOIN restaurants r ON r.id=p.restaurant_id WHERE r.name='Tonton G' AND p.name='Fiteuf';
