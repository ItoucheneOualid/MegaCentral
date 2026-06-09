-- =====================================================
-- MIGRATION : Normalisation BD selon Diagramme de Classes
-- MySQL 5.6 Compatible
-- Date: 2026-06-01
-- =====================================================

USE idmegacentral;

-- =====================================================
-- 1. RESTRUCTURER LA TABLE CLIENTS
-- =====================================================

-- Ajouter la colonne client_id à ventes
ALTER TABLE ventes 
ADD COLUMN client_id INT(10) UNSIGNED DEFAULT NULL AFTER VTCLEUNIK;

-- Ajouter l'index
ALTER TABLE ventes 
ADD KEY idx_ventes_client_id (client_id);

-- =====================================================
-- 2. PEUPLER LA TABLE CLIENTS À PARTIR DE VENTES
-- =====================================================

-- Insérer les clients uniques depuis ventes
-- Compatible MySQL 5.6 (pas de ROW_NUMBER())
INSERT IGNORE INTO clients (CLcleunik, Client_No, Nom_Société, Email, Derniere_MAJ)
SELECT 
  @rn := @rn + 1 + COALESCE((SELECT MAX(CLcleunik) FROM clients), 1000) AS CLcleunik,
  v.Client_No,
  v.Client_Nom AS Nom_Société,
  '' AS Email,
  CURDATE() AS Derniere_MAJ
FROM (
  SELECT DISTINCT Client_No, Client_Nom 
  FROM ventes 
  WHERE Client_No IS NOT NULL 
    AND Client_No NOT IN (SELECT DISTINCT Client_No FROM clients WHERE Client_No IS NOT NULL)
) v, (SELECT @rn := 0) counter;

-- =====================================================
-- 3. METTRE À JOUR VENTES POUR UTILISER client_id
-- =====================================================

-- Mapper Client_No vers client_id
UPDATE ventes v
SET v.client_id = (
  SELECT c.CLcleunik 
  FROM clients c 
  WHERE c.Client_No = v.Client_No 
  LIMIT 1
)
WHERE v.client_id IS NULL 
  AND v.Client_No IS NOT NULL;

-- =====================================================
-- 4. AJOUTER LES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- =====================================================

-- FK pour ventes -> clients
ALTER TABLE ventes 
ADD CONSTRAINT fk_ventes_client 
FOREIGN KEY (client_id) REFERENCES clients(CLcleunik) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- FK pour ventes -> magasin
ALTER TABLE ventes 
ADD CONSTRAINT fk_ventes_magasin 
FOREIGN KEY (Code_magasin) REFERENCES magasin(Code_Magasin) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- =====================================================
-- 5. NORMALISER LES AUTRES TABLES
-- =====================================================

-- FK pour articles -> TVA
ALTER TABLE articles 
ADD CONSTRAINT fk_articles_tva 
FOREIGN KEY (TVA_CLEUNIK) REFERENCES tva(TVA_ID) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- FK pour articles -> familles2
ALTER TABLE articles 
ADD CONSTRAINT fk_articles_famille2 
FOREIGN KEY (F2_CLEUNIK) REFERENCES familles2(F2CLEUNIK) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- FK pour articles -> fournis
ALTER TABLE articles 
ADD CONSTRAINT fk_articles_fournisseur 
FOREIGN KEY (FRN_CLEUNIK) REFERENCES fournis(FRCLEUNIK) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- =====================================================
-- 6. AJOUTER LES COLONNES MANQUANTES SI NÉCESSAIRE
-- =====================================================

-- Ajouter telephone à clients s'il n'existe pas
ALTER TABLE clients 
ADD COLUMN Telephone VARCHAR(30);

-- =====================================================
-- 7. CRÉER LES VUES POUR VALIDATION
-- =====================================================

-- Vue pour valider les ventes sans client
DROP VIEW IF EXISTS vue_ventes_sans_client;
CREATE VIEW vue_ventes_sans_client AS
SELECT v.VTCLEUNIK, v.Numero, v.Date, v.Client_No, v.Client_Nom, v.Total_TTC
FROM ventes v
WHERE v.client_id IS NULL
  AND v.Client_No IS NOT NULL;

-- Vue pour valider la liaison client-vente
DROP VIEW IF EXISTS vue_liaison_clients_ventes;
CREATE VIEW vue_liaison_clients_ventes AS
SELECT 
  c.CLcleunik,
  c.Client_No,
  c.Nom_Société,
  COUNT(v.VTCLEUNIK) AS nb_ventes,
  COALESCE(SUM(v.Total_TTC), 0) AS total_ventes_ttc
FROM clients c
LEFT JOIN ventes v ON c.CLcleunik = v.client_id
GROUP BY c.CLcleunik, c.Client_No, c.Nom_Société;

-- =====================================================
-- 8. STATISTIQUES
-- =====================================================

SELECT 'Migration completed - Tables statistics:' AS status;

SELECT 
  'Clients' AS table_name,
  COUNT(*) AS total_records
FROM clients
UNION ALL
SELECT 'Ventes', COUNT(*) FROM ventes
UNION ALL
SELECT 'Ventes with client_id', COUNT(*) FROM ventes WHERE client_id IS NOT NULL;
