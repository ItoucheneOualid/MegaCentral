-- =====================================================================
-- 10_migration_compat.sql — compatibilité export MegaCaisse (WinDev)
-- NE PAS EXÉCUTER EN PRODUCTION AVANT : (1) diagnostic 00, (2) sauvegarde,
-- (3) exécution + 20_verify_on_copy.sql sur une COPIE (fork Aiven) avec succès.
-- Client : mysql CLI (supporte DELIMITER), pas mysql2 en multi-statements.
-- Conçu pour : MySQL 8.4, lower_case_table_names=0 (Aiven, Linux), STRICT conservé.
-- Les noms réels ci-dessous (tva, users, zreports...) DOIVENT être confirmés par 00 §2.
-- =====================================================================
USE idmegacentral_v14;
SET SESSION group_concat_max_len = 65535;
-- Session uniquement : les ALTER reconstruisent la table et refuseraient les 0000-00-00 hérités d'autres colonnes.
SET SESSION sql_mode = REPLACE(REPLACE(@@SESSION.sql_mode, 'NO_ZERO_DATE', ''), 'NO_ZERO_IN_DATE', '');

-- ---------------------------------------------------------------------
-- A. CASSE : vues-alias aux noms utilisés par l'export (TVA -> tva, ...)
--    Les tables réelles (minuscules) restent inchangées : le site et l'API
--    sync continuent d'utiliser les noms minuscules.
--    Vue simple = « updatable » : INSERT / UPDATE / DELETE / REPLACE /
--    INSERT ... ON DUPLICATE KEY UPDATE fonctionnent, et les triggers de la
--    table de base se déclenchent. TRUNCATE / ALTER / DROP TABLE ne marchent pas.
-- ---------------------------------------------------------------------
DELIMITER $$

DROP PROCEDURE IF EXISTS mc_compat_alias$$
CREATE PROCEDURE mc_compat_alias(IN p_alias VARCHAR(64), IN p_real VARCHAR(64))
BEGIN
  DECLARE v_cols TEXT;
  IF EXISTS (SELECT 1 FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND BINARY TABLE_NAME = BINARY p_alias) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Alias deja existant (table ou vue) : abandon';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE() AND BINARY TABLE_NAME = BINARY p_real
                   AND TABLE_TYPE = 'BASE TABLE') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Table reelle introuvable (verifier la casse) : abandon';
  END IF;
  SELECT GROUP_CONCAT(CONCAT('`', COLUMN_NAME, '`') ORDER BY ORDINAL_POSITION SEPARATOR ', ')
    INTO v_cols
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND BINARY TABLE_NAME = BINARY p_real;
  -- Liste de colonnes explicite et ordonnée : fige la structure et garde valides les INSERT positionnels.
  SET @mc_sql = CONCAT('CREATE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW `', p_alias,
                       '` AS SELECT ', v_cols, ' FROM `', p_real, '`');
  PREPARE s FROM @mc_sql; EXECUTE s; DEALLOCATE PREPARE s;
END$$

DELIMITER ;

-- Diagnostic réel (Aiven, 26/10) : l'export écrit déjà en minuscules pour toutes les tables sauf TVA
-- (8 erreurs 1146). Un seul alias est donc nécessaire. Ajouter un alias seulement si une nouvelle
-- erreur 1146 apparaît pour une autre table.
CALL mc_compat_alias('TVA', 'tva');

DROP PROCEDURE mc_compat_alias;

-- Si dev_megacaisse n'a pas de droit au niveau schéma (idmegacentral_v14.*), accorder par vue :
-- GRANT SELECT, INSERT, UPDATE, DELETE ON idmegacentral_v14.`TVA` TO 'dev_megacaisse'@'%';  (idem autres vues)

-- ---------------------------------------------------------------------
-- B. DATES : '' n'est PAS NULL. Une colonne DATE nullable refuse quand même ''
--    (erreur 1292 en mode strict) ET un trigger BEFORE ne peut pas y remédier :
--    la conversion '' -> DATE a lieu avant l'exécution du trigger.
--    => seules les colonnes réellement concernées passent en VARCHAR(32) NULL ;
--       un trigger normalise : ''/espaces/0000-00-00 -> NULL, 'YYYYMMDD' ou
--       'YYYY-MM-DD hh:mm:ss' -> 'YYYY-MM-DD', toute autre valeur -> erreur
--       explicite (rien n'est inventé, rien n'est tronqué silencieusement).
--    VARCHAR(32) (et non 10) pour que la valeur arrive jusqu'au trigger.
--    Aucune colonne ajoutée/déplacée : les INSERT positionnels restent valides.
-- ---------------------------------------------------------------------
-- (Colonnes confirmées par l'erreur 1292 ou par 00 §9. Tables : noms réels.)
ALTER TABLE articles
  MODIFY COLUMN Promo_Date_Debut VARCHAR(32) NULL DEFAULT NULL,
  MODIFY COLUMN Promo_Date_Fin   VARCHAR(32) NULL DEFAULT NULL;
ALTER TABLE familles2
  MODIFY COLUMN Periode_du VARCHAR(32) NULL DEFAULT NULL,
  MODIFY COLUMN Periode_au VARCHAR(32) NULL DEFAULT NULL;
-- fournis : 1 erreur 1292 constatée (colonne exacte non confirmée ; Date_Entree est la seule date
-- que la caisse peut laisser vide, Derniere_MAJ est toujours envoyée). Le site lit/écrit Date_Entree en YYYY-MM-DD.
ALTER TABLE fournis
  MODIFY COLUMN Date_Entree VARCHAR(32) NULL DEFAULT NULL;

DELIMITER $$

DROP FUNCTION IF EXISTS mc_clean_date$$
CREATE FUNCTION mc_clean_date(p VARCHAR(64)) RETURNS VARCHAR(10) DETERMINISTIC
BEGIN
  DECLARE v VARCHAR(64);
  DECLARE d DATE DEFAULT NULL;
  IF p IS NULL THEN RETURN NULL; END IF;
  SET v = TRIM(p);
  IF v = '' OR v IN ('0000-00-00', '00000000', '0000-00-00 00:00:00') THEN RETURN NULL; END IF;
  IF v REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}([ T][0-9]{2}:[0-9]{2}:[0-9]{2})?$' THEN
    SET d = STR_TO_DATE(LEFT(v, 10), '%Y-%m-%d');
  ELSEIF v REGEXP '^[0-9]{8}$' THEN
    SET d = STR_TO_DATE(v, '%Y%m%d');
  END IF;
  IF d IS NULL THEN
    SIGNAL SQLSTATE '22007' SET MESSAGE_TEXT = 'MegaCaisse: valeur de date invalide (ni vide, ni YYYY-MM-DD)';
  END IF;
  RETURN DATE_FORMAT(d, '%Y-%m-%d');
END$$

DROP TRIGGER IF EXISTS trg_mc_articles_bi$$
CREATE TRIGGER trg_mc_articles_bi BEFORE INSERT ON articles FOR EACH ROW
BEGIN
  SET NEW.Promo_Date_Debut = mc_clean_date(NEW.Promo_Date_Debut);
  SET NEW.Promo_Date_Fin   = mc_clean_date(NEW.Promo_Date_Fin);
END$$
DROP TRIGGER IF EXISTS trg_mc_articles_bu$$
CREATE TRIGGER trg_mc_articles_bu BEFORE UPDATE ON articles FOR EACH ROW
BEGIN
  SET NEW.Promo_Date_Debut = mc_clean_date(NEW.Promo_Date_Debut);
  SET NEW.Promo_Date_Fin   = mc_clean_date(NEW.Promo_Date_Fin);
END$$

DROP TRIGGER IF EXISTS trg_mc_familles2_bi$$
CREATE TRIGGER trg_mc_familles2_bi BEFORE INSERT ON familles2 FOR EACH ROW
BEGIN
  SET NEW.Periode_du = mc_clean_date(NEW.Periode_du);
  SET NEW.Periode_au = mc_clean_date(NEW.Periode_au);
END$$
DROP TRIGGER IF EXISTS trg_mc_familles2_bu$$
CREATE TRIGGER trg_mc_familles2_bu BEFORE UPDATE ON familles2 FOR EACH ROW
BEGIN
  SET NEW.Periode_du = mc_clean_date(NEW.Periode_du);
  SET NEW.Periode_au = mc_clean_date(NEW.Periode_au);
END$$

DROP TRIGGER IF EXISTS trg_mc_fournis_bi$$
CREATE TRIGGER trg_mc_fournis_bi BEFORE INSERT ON fournis FOR EACH ROW
BEGIN
  SET NEW.Date_Entree = mc_clean_date(NEW.Date_Entree);
END$$
DROP TRIGGER IF EXISTS trg_mc_fournis_bu$$
CREATE TRIGGER trg_mc_fournis_bu BEFORE UPDATE ON fournis FOR EACH ROW
BEGIN
  SET NEW.Date_Entree = mc_clean_date(NEW.Date_Entree);
END$$

DELIMITER ;

-- Normalise l'existant
UPDATE articles SET Promo_Date_Debut = Promo_Date_Debut, Promo_Date_Fin = Promo_Date_Fin
 WHERE Promo_Date_Debut = '0000-00-00' OR Promo_Date_Fin = '0000-00-00';
UPDATE familles2 SET Periode_du = Periode_du, Periode_au = Periode_au
 WHERE Periode_du = '0000-00-00' OR Periode_au = '0000-00-00';

-- OPTIONNEL (filet déclaratif) : à ajouter seulement si 20_verify confirme que le CHECK est évalué
-- APRÈS le trigger (sinon les '' seraient refusés). Sinon ne pas l'ajouter.
-- ALTER TABLE articles ADD CONSTRAINT chk_mc_articles_promo CHECK (
--   (Promo_Date_Debut IS NULL OR Promo_Date_Debut REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$') AND
--   (Promo_Date_Fin   IS NULL OR Promo_Date_Fin   REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'));
-- ALTER TABLE familles2 ADD CONSTRAINT chk_mc_familles2_periode CHECK (
--   (Periode_du IS NULL OR Periode_du REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$') AND
--   (Periode_au IS NULL OR Periode_au REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'));

-- Autres colonnes date : ne les traiter qu'après preuve (00 §9 : erreur 1292 sur la colonne), même recette.
-- ATTENTION : Derniere_MAJ, Date_Entree, Date_Commande... sont lues par le site (DATE_FORMAT, tri) :
-- les convertir impose de revérifier commandesController, fournisseursController, tvaController, etc.

-- ---------------------------------------------------------------------
-- C. NOT NULL SANS DÉFAUT jugés non indispensables (valeur vide = absence d'info)
--    Un DÉFAUT ne s'applique que si la colonne est OMISE de l'INSERT.
--    '' explicite reste ''. NULL explicite sur NOT NULL reste une erreur (1048).
--    Ne lancer que si le SHOW CREATE TABLE réel (00 §3/§4) correspond au schéma de référence.
-- ---------------------------------------------------------------------
-- Le site (tickets.controller) initialise déjà PDF_Base64 à '' et teste « IS NOT NULL AND != '' » : comportement inchangé.
ALTER TABLE tickets
  MODIFY COLUMN PDF_Base64 LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ('');
ALTER TABLE ventes
  MODIFY COLUMN Email_Client VARCHAR(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '';
-- Montant : 0 serait une valeur inventée -> colonne simplement facultative (NULL = non renseigné).
ALTER TABLE zreports
  MODIFY COLUMN Total_Cash DECIMAL(10,0) NULL DEFAULT NULL;

-- CONSERVÉ NOT NULL (indispensable au site / aux relations) : toutes les clés primaires
-- (ARCLEUNIK, F1cleunik, F2CLEUNIK, FRCLEUNIK, CLcleunik, CFCLEUNIK, BLCLEUNIK, IDBarCodes, Numero, TVA_ID, id...),
-- articles.LIBELLE, familles1/2.Description, familles2.F1CLEUNIK, fournis.Fournis_No/Nom_Societe, clients.Client_No,
-- barcodes.ARCLEUNIK/CodeBarre, BC_FRN.FRCLEUNIK, ventes.VTCLEUNIK/Numero/Date/Type, Art_Stat.* (toutes), Users.id.
