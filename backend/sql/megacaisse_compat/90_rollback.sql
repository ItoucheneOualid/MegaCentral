-- =====================================================================
-- 90_rollback.sql — retour arrière logique de 10_migration_compat.sql
-- Le vrai filet de sécurité reste la sauvegarde/fork Aiven (voir README.md).
-- Exécuter avec le mysql CLI (DELIMITER non requis ici).
-- =====================================================================
USE idmegacentral_v14;

-- 0. PRÉ-CONTRÔLES : ces requêtes doivent retourner 0, sinon le retour arrière ferait perdre/inventer des données.
SELECT COUNT(*) AS zreports_total_cash_null FROM zreports WHERE Total_Cash IS NULL;   -- NULL non convertible en NOT NULL sans inventer 0
SELECT COUNT(*) AS dates_non_iso FROM (
  SELECT Promo_Date_Debut AS v FROM articles UNION ALL SELECT Promo_Date_Fin FROM articles
  UNION ALL SELECT Periode_du FROM familles2 UNION ALL SELECT Periode_au FROM familles2
  UNION ALL SELECT Date_Entree FROM fournis
  UNION ALL SELECT `Date_Modifiée` FROM articles UNION ALL SELECT Date_importation FROM articles
  UNION ALL SELECT Suspendu_Date FROM articles UNION ALL SELECT Derniere_MAJ FROM articles
  UNION ALL SELECT Date_Entree FROM clients) x
WHERE v IS NOT NULL AND v NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';

-- 1. Retirer les protections d'import
DROP TRIGGER IF EXISTS trg_mc_articles_bi;
DROP TRIGGER IF EXISTS trg_mc_articles_bu;
DROP TRIGGER IF EXISTS trg_mc_familles2_bi;
DROP TRIGGER IF EXISTS trg_mc_familles2_bu;
DROP TRIGGER IF EXISTS trg_mc_fournis_bi;
DROP TRIGGER IF EXISTS trg_mc_fournis_bu;
DROP TRIGGER IF EXISTS trg_mc_clients_bi;
DROP TRIGGER IF EXISTS trg_mc_clients_bu;
-- ALTER TABLE articles  DROP CHECK chk_mc_articles_promo;     -- si ajoutés
-- ALTER TABLE familles2 DROP CHECK chk_mc_familles2_periode;  -- si ajoutés
DROP FUNCTION IF EXISTS mc_clean_date;

-- 2. Alias de casse (les tables réelles ne sont pas touchées)
DROP VIEW IF EXISTS `TVA`;

-- 3. Types d'origine (VARCHAR 'YYYY-MM-DD' -> DATE sans perte ; NULL reste NULL)
ALTER TABLE articles
  MODIFY COLUMN Promo_Date_Debut DATE NULL DEFAULT NULL,
  MODIFY COLUMN Promo_Date_Fin   DATE NULL DEFAULT NULL,
  MODIFY COLUMN `Date_Modifiée`  DATE NULL DEFAULT NULL,
  MODIFY COLUMN Date_importation DATE NULL DEFAULT NULL,
  MODIFY COLUMN Suspendu_Date    DATE NULL DEFAULT NULL,
  MODIFY COLUMN Derniere_MAJ     DATE NULL DEFAULT NULL;
ALTER TABLE clients MODIFY COLUMN Date_Entree DATE NULL DEFAULT NULL;
ALTER TABLE familles2
  MODIFY COLUMN Periode_du DATE NULL DEFAULT NULL,
  MODIFY COLUMN Periode_au DATE NULL DEFAULT NULL;
ALTER TABLE fournis MODIFY COLUMN Date_Entree DATE NULL DEFAULT NULL;

-- 4. Défauts d'origine
ALTER TABLE tickets  MODIFY COLUMN PDF_Base64   LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE ventes   MODIFY COLUMN Email_Client VARCHAR(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE zreports MODIFY COLUMN Total_Cash   DECIMAL(10,0) NOT NULL;   -- échoue volontairement si des NULL existent (pré-contrôle 0)
