-- =====================================================================
-- 13_migration_vidange_code.sql — complément de 10, 11, 12
-- Erreur constatée à l'export : 1366 Incorrect decimal value: '' for column 'Vidange_Code'.
-- Même recette que pour les dates : '' n'est pas un nombre, et la conversion a lieu avant le trigger.
-- => articles.Vidange_Code passe en VARCHAR(32) NULL ; mc_clean_num normalise :
--    ''/espaces -> NULL (pas de 0 inventé), nombre '12' / '-1.5' conservé, autre texte -> erreur explicite.
-- Le site n'utilise pas Vidange_Code (aucune occurrence dans le code).
-- Prérequis : 10 et 11 (triggers articles). Rejouable.
-- =====================================================================
USE idmegacentral_v14;

ALTER TABLE articles
  MODIFY COLUMN Vidange_Code VARCHAR(32) NULL DEFAULT NULL;

DELIMITER $$

DROP FUNCTION IF EXISTS mc_clean_num$$
CREATE FUNCTION mc_clean_num(p VARCHAR(64)) RETURNS VARCHAR(32) DETERMINISTIC
BEGIN
  DECLARE v VARCHAR(64);
  IF p IS NULL THEN RETURN NULL; END IF;
  SET v = TRIM(p);
  IF v = '' THEN RETURN NULL; END IF;
  IF v NOT REGEXP '^-?[0-9]+([.][0-9]+)?$' THEN
    SIGNAL SQLSTATE '22007' SET MESSAGE_TEXT = 'MegaCaisse: valeur numerique invalide (ni vide, ni nombre)';
  END IF;
  RETURN v;
END$$

DROP TRIGGER IF EXISTS trg_mc_articles_bi$$
CREATE TRIGGER trg_mc_articles_bi BEFORE INSERT ON articles FOR EACH ROW
BEGIN
  SET NEW.Promo_Date_Debut = mc_clean_date(NEW.Promo_Date_Debut);
  SET NEW.Promo_Date_Fin   = mc_clean_date(NEW.Promo_Date_Fin);
  SET NEW.`Date_Modifiée`  = mc_clean_date(NEW.`Date_Modifiée`);
  SET NEW.Date_importation = mc_clean_date(NEW.Date_importation);
  SET NEW.Suspendu_Date    = mc_clean_date(NEW.Suspendu_Date);
  SET NEW.Derniere_MAJ     = mc_clean_date(NEW.Derniere_MAJ);
  SET NEW.Vidange_Code     = mc_clean_num(NEW.Vidange_Code);
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
  SET NEW.Vidange_Code     = mc_clean_num(NEW.Vidange_Code);
END$$

DELIMITER ;
