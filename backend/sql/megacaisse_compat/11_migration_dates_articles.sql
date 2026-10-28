-- =====================================================================
-- 11_migration_dates_articles.sql — complément de 10_migration_compat.sql
-- Erreur constatée à l'export : 1292 Incorrect date value: '' for column 'Date_importation'.
-- Même recette que 10 §B : colonne VARCHAR(32) NULL + trigger mc_clean_date
-- ('' -> NULL, 'YYYYMMDD' -> 'YYYY-MM-DD', valeur invalide -> erreur).
-- Le site ne lit aucune de ces colonnes comme date (seul articles.Date_Modifiée est écrit par NOW()).
-- Prérequis : 10_migration_compat.sql déjà appliqué (fonction mc_clean_date).
-- Rejouable sans risque.
-- =====================================================================
USE idmegacentral_v14;

SET SESSION sql_mode = REPLACE(REPLACE(@@SESSION.sql_mode, 'NO_ZERO_DATE', ''), 'NO_ZERO_IN_DATE', '');

ALTER TABLE articles
  MODIFY COLUMN `Date_Modifiée`   VARCHAR(32) NULL DEFAULT NULL,
  MODIFY COLUMN Date_importation  VARCHAR(32) NULL DEFAULT NULL,
  MODIFY COLUMN Suspendu_Date     VARCHAR(32) NULL DEFAULT NULL,
  MODIFY COLUMN Derniere_MAJ      VARCHAR(32) NULL DEFAULT NULL;
ALTER TABLE clients
  MODIFY COLUMN Date_Entree       VARCHAR(32) NULL DEFAULT NULL;

DELIMITER $$

DROP TRIGGER IF EXISTS trg_mc_articles_bi$$
CREATE TRIGGER trg_mc_articles_bi BEFORE INSERT ON articles FOR EACH ROW
BEGIN
  SET NEW.Promo_Date_Debut = mc_clean_date(NEW.Promo_Date_Debut);
  SET NEW.Promo_Date_Fin   = mc_clean_date(NEW.Promo_Date_Fin);
  SET NEW.`Date_Modifiée`  = mc_clean_date(NEW.`Date_Modifiée`);
  SET NEW.Date_importation = mc_clean_date(NEW.Date_importation);
  SET NEW.Suspendu_Date    = mc_clean_date(NEW.Suspendu_Date);
  SET NEW.Derniere_MAJ     = mc_clean_date(NEW.Derniere_MAJ);
END$$
DROP TRIGGER IF EXISTS trg_mc_articles_bu$$
CREATE TRIGGER trg_mc_articles_bu BEFORE UPDATE ON articles FOR EACH ROW
BEGIN
  SET NEW.Promo_Date_Debut = mc_clean_date(NEW.Promo_Date_Debut);
  SET NEW.Promo_Date_Fin   = mc_clean_date(NEW.Promo_Date_Fin);
  SET NEW.`Date_Modifiée`  = mc_clean_date(NEW.`Date_Modifiée`);
  SET NEW.Date_importation = mc_clean_date(NEW.Date_importation);
  SET NEW.Suspendu_Date    = mc_clean_date(NEW.Suspendu_Date);
  SET NEW.Derniere_MAJ     = mc_clean_date(NEW.Derniere_MAJ);
END$$

DROP TRIGGER IF EXISTS trg_mc_clients_bi$$
CREATE TRIGGER trg_mc_clients_bi BEFORE INSERT ON clients FOR EACH ROW
BEGIN
  SET NEW.Date_Entree = mc_clean_date(NEW.Date_Entree);
END$$
DROP TRIGGER IF EXISTS trg_mc_clients_bu$$
CREATE TRIGGER trg_mc_clients_bu BEFORE UPDATE ON clients FOR EACH ROW
BEGIN
  SET NEW.Date_Entree = mc_clean_date(NEW.Date_Entree);
END$$

DELIMITER ;

-- Normalise l'existant (les anciens 0000-00-00 deviennent NULL)
UPDATE articles SET Derniere_MAJ = Derniere_MAJ
 WHERE Date_importation = '0000-00-00' OR `Date_Modifiée` = '0000-00-00'
    OR Suspendu_Date = '0000-00-00' OR Derniere_MAJ = '0000-00-00';
