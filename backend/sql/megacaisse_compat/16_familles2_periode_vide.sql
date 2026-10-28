-- =====================================================================
-- 16_familles2_periode_vide.sql — complément de 10 à 15
-- Demande : familles2.Periode_du et Periode_au vides ('') par défaut, et non NULL.
-- Colonnes VARCHAR(32) NOT NULL DEFAULT '' ; le trigger garde les dates valides en 'YYYY-MM-DD'
-- (YYYYMMDD converti), transforme NULL en '', conserve '', et refuse toute autre valeur invalide.
-- Le site n'utilise pas ces colonnes. Prérequis : 10 (fonction mc_clean_date). Rejouable.
-- Ordre important : triggers d'abord (sinon l'ancien trigger remet '' en NULL), puis UPDATE, puis ALTER.
-- NB : si 10_migration_compat.sql est rejoué, relancer ensuite ce fichier (il recrée les triggers familles2).
-- =====================================================================
USE idmegacentral_v14;

DELIMITER $$

DROP TRIGGER IF EXISTS trg_mc_familles2_bi$$
CREATE TRIGGER trg_mc_familles2_bi BEFORE INSERT ON familles2 FOR EACH ROW
BEGIN
  SET NEW.Periode_du = IFNULL(mc_clean_date(NEW.Periode_du), '');
  SET NEW.Periode_au = IFNULL(mc_clean_date(NEW.Periode_au), '');
END$$
DROP TRIGGER IF EXISTS trg_mc_familles2_bu$$
CREATE TRIGGER trg_mc_familles2_bu BEFORE UPDATE ON familles2 FOR EACH ROW
BEGIN
  SET NEW.Periode_du = IFNULL(mc_clean_date(NEW.Periode_du), '');
  SET NEW.Periode_au = IFNULL(mc_clean_date(NEW.Periode_au), '');
END$$

DELIMITER ;

-- Le trigger BEFORE UPDATE transforme les NULL en ''
UPDATE familles2 SET Periode_du = Periode_du, Periode_au = Periode_au
 WHERE Periode_du IS NULL OR Periode_au IS NULL;

ALTER TABLE familles2
  MODIFY COLUMN Periode_du VARCHAR(32) NOT NULL DEFAULT '',
  MODIFY COLUMN Periode_au VARCHAR(32) NOT NULL DEFAULT '';
