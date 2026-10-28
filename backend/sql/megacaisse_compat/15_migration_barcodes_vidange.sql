-- =====================================================================
-- 15_migration_barcodes_vidange.sql — complément de 10 à 14
-- Erreur constatée à l'export : 1366 Incorrect integer value: '' for column 'Vidange_Code' (table barcodes, INT).
-- Même recette que articles.Vidange_Code : VARCHAR(32) NULL + trigger.
-- mc_clean_int : ''/espaces -> NULL (pas de 0 inventé), entier conservé, autre texte -> erreur explicite.
-- Le site n'utilise pas barcodes.Vidange_Code. Rejouable.
-- =====================================================================
USE idmegacentral_v14;

ALTER TABLE barcodes
  MODIFY COLUMN Vidange_Code VARCHAR(32) NULL DEFAULT NULL;

DELIMITER $$

DROP FUNCTION IF EXISTS mc_clean_int$$
CREATE FUNCTION mc_clean_int(p VARCHAR(64)) RETURNS VARCHAR(32) DETERMINISTIC
BEGIN
  DECLARE v VARCHAR(64);
  IF p IS NULL THEN RETURN NULL; END IF;
  SET v = TRIM(p);
  IF v = '' THEN RETURN NULL; END IF;
  IF v NOT REGEXP '^-?[0-9]{1,10}$' THEN
    SIGNAL SQLSTATE '22007' SET MESSAGE_TEXT = 'MegaCaisse: valeur entiere invalide (ni vide, ni entier)';
  END IF;
  RETURN v;
END$$

DROP TRIGGER IF EXISTS trg_mc_barcodes_bi$$
CREATE TRIGGER trg_mc_barcodes_bi BEFORE INSERT ON barcodes FOR EACH ROW
BEGIN
  SET NEW.Vidange_Code = mc_clean_int(NEW.Vidange_Code);
END$$
DROP TRIGGER IF EXISTS trg_mc_barcodes_bu$$
CREATE TRIGGER trg_mc_barcodes_bu BEFORE UPDATE ON barcodes FOR EACH ROW
BEGIN
  SET NEW.Vidange_Code = mc_clean_int(NEW.Vidange_Code);
END$$

DELIMITER ;
