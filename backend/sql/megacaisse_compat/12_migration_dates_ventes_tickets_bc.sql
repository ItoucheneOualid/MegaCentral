-- =====================================================================
-- 12_migration_dates_ventes_tickets_bc.sql — complément de 10 et 11
-- Dates facultatives que la caisse peut envoyer vides : ventes.Echeance/Liv_Date,
-- tickets.Echeance, bc_frn.Date_Commande/Date_Livraison.
-- Même recette : VARCHAR(32) NULL + trigger mc_clean_date ('' -> NULL, YYYYMMDD -> YYYY-MM-DD, invalide -> erreur).
-- ventes.Date reste DATE NOT NULL (indispensable, '' refusé).
-- Le site lit bc_frn via formatDate (String(date).split('T')[0]) : les chaînes 'YYYY-MM-DD' s'affichent et se trient pareil.
-- Prérequis : 10_migration_compat.sql (fonction mc_clean_date). Rejouable.
-- =====================================================================
USE idmegacentral_v14;

SET SESSION sql_mode = REPLACE(REPLACE(@@SESSION.sql_mode, 'NO_ZERO_DATE', ''), 'NO_ZERO_IN_DATE', '');

ALTER TABLE ventes
  MODIFY COLUMN Echeance VARCHAR(32) NULL DEFAULT NULL,
  MODIFY COLUMN Liv_Date VARCHAR(32) NULL DEFAULT NULL;
ALTER TABLE tickets
  MODIFY COLUMN Echeance VARCHAR(32) NULL DEFAULT NULL;
ALTER TABLE bc_frn
  MODIFY COLUMN Date_Commande  VARCHAR(32) NULL DEFAULT NULL,
  MODIFY COLUMN Date_Livraison VARCHAR(32) NULL DEFAULT NULL;

DELIMITER $$

DROP TRIGGER IF EXISTS trg_mc_ventes_bi$$
CREATE TRIGGER trg_mc_ventes_bi BEFORE INSERT ON ventes FOR EACH ROW
BEGIN
  SET NEW.Echeance = mc_clean_date(NEW.Echeance);
  SET NEW.Liv_Date = mc_clean_date(NEW.Liv_Date);
END$$
DROP TRIGGER IF EXISTS trg_mc_ventes_bu$$
CREATE TRIGGER trg_mc_ventes_bu BEFORE UPDATE ON ventes FOR EACH ROW
BEGIN
  SET NEW.Echeance = mc_clean_date(NEW.Echeance);
  SET NEW.Liv_Date = mc_clean_date(NEW.Liv_Date);
END$$

DROP TRIGGER IF EXISTS trg_mc_tickets_bi$$
CREATE TRIGGER trg_mc_tickets_bi BEFORE INSERT ON tickets FOR EACH ROW
BEGIN
  SET NEW.Echeance = mc_clean_date(NEW.Echeance);
END$$
DROP TRIGGER IF EXISTS trg_mc_tickets_bu$$
CREATE TRIGGER trg_mc_tickets_bu BEFORE UPDATE ON tickets FOR EACH ROW
BEGIN
  SET NEW.Echeance = mc_clean_date(NEW.Echeance);
END$$

DROP TRIGGER IF EXISTS trg_mc_bc_frn_bi$$
CREATE TRIGGER trg_mc_bc_frn_bi BEFORE INSERT ON bc_frn FOR EACH ROW
BEGIN
  SET NEW.Date_Commande  = mc_clean_date(NEW.Date_Commande);
  SET NEW.Date_Livraison = mc_clean_date(NEW.Date_Livraison);
END$$
DROP TRIGGER IF EXISTS trg_mc_bc_frn_bu$$
CREATE TRIGGER trg_mc_bc_frn_bu BEFORE UPDATE ON bc_frn FOR EACH ROW
BEGIN
  SET NEW.Date_Commande  = mc_clean_date(NEW.Date_Commande);
  SET NEW.Date_Livraison = mc_clean_date(NEW.Date_Livraison);
END$$

DELIMITER ;

-- Normalise l'existant (les anciens 0000-00-00 deviennent NULL)
UPDATE ventes SET Echeance = Echeance WHERE Echeance = '0000-00-00' OR Liv_Date = '0000-00-00';
UPDATE tickets SET Echeance = Echeance WHERE Echeance = '0000-00-00';
UPDATE bc_frn SET Date_Commande = Date_Commande WHERE Date_Commande = '0000-00-00' OR Date_Livraison = '0000-00-00';
