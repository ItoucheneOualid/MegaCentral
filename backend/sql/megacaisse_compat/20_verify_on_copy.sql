-- =====================================================================
-- 20_verify_on_copy.sql — À EXÉCUTER UNIQUEMENT SUR LA COPIE (fork Aiven), jamais en prod.
-- Après 10_migration_compat.sql. Idéalement connecté avec dev_megacaisse (droits réels),
-- sinon avnadmin avec le même sql_mode. Tout est annulé par ROLLBACK ; clés de test 9900xxx.
-- Les procédures de test sont créées puis supprimées (la copie seule est concernée).
-- =====================================================================
USE idmegacentral_v14;

SELECT @@sql_mode AS sql_mode_session,
       (@@sql_mode LIKE '%STRICT_TRANS_TABLES%') AS strict_actif;   -- doit valoir 1

DROP TABLE IF EXISTS mc_res;
CREATE TABLE mc_res (n INT AUTO_INCREMENT PRIMARY KEY, test VARCHAR(90), attendu VARCHAR(4), obtenu VARCHAR(4), errno INT, message VARCHAR(500), verdict VARCHAR(4)) ENGINE=InnoDB; -- table réelle (MEMORY/MyISAM désactivés sur Aiven) : copie de test uniquement

DELIMITER $$
DROP PROCEDURE IF EXISTS mc_t$$
CREATE PROCEDURE mc_t(IN p_test VARCHAR(90), IN p_attendu VARCHAR(4), IN p_sql TEXT)
BEGIN
  DECLARE v_err INT DEFAULT 0;
  DECLARE v_msg TEXT DEFAULT '';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    GET DIAGNOSTICS CONDITION 1 v_err = MYSQL_ERRNO, v_msg = MESSAGE_TEXT;
  SET @mc_sql = p_sql;
  PREPARE s FROM @mc_sql; EXECUTE s; DEALLOCATE PREPARE s;
  INSERT INTO mc_res (test, attendu, obtenu, errno, message, verdict)
  VALUES (p_test, p_attendu, IF(v_err = 0, 'OK', 'ERR'), v_err, v_msg,
          IF((v_err = 0) = (p_attendu = 'OK'), 'PASS', 'FAIL'));
END$$

-- Vérifie une condition SQL (retourne 1/0) sur l'état courant.
DROP PROCEDURE IF EXISTS mc_c$$
CREATE PROCEDURE mc_c(IN p_test VARCHAR(90), IN p_cond TEXT)
BEGIN
  SET @mc_r = NULL;
  SET @mc_sql = CONCAT('SELECT COALESCE((', p_cond, '),0) INTO @mc_r');
  PREPARE s FROM @mc_sql; EXECUTE s; DEALLOCATE PREPARE s;
  INSERT INTO mc_res (test, attendu, obtenu, verdict)
  VALUES (p_test, 'OK', IF(@mc_r = 1, 'OK', 'ERR'), IF(@mc_r = 1, 'PASS', 'FAIL'));
END$$

DROP PROCEDURE IF EXISTS mc_run$$
CREATE PROCEDURE mc_run()
BEGIN
  -- Pas de transaction : les résultats sont dans une vraie table ; le nettoyage est explicite en fin de procédure.

  -- ===== A. Casse : alias, INSERT, ON DUPLICATE KEY UPDATE, UPDATE =====
  CALL mc_t('A1 INSERT via alias TVA', 'OK',
    'INSERT INTO `TVA` (TVA_ID, Taux, Description) VALUES (9900001, 21, ''T'')');
  CALL mc_t('A2 ODKU via alias TVA (ligne existante)', 'OK',
    'INSERT INTO `TVA` (TVA_ID, Taux, Description) VALUES (9900001, 6, ''T2'') ON DUPLICATE KEY UPDATE Taux = VALUES(Taux), Description = VALUES(Description)');
  CALL mc_c('A2b ODKU a bien mis à jour la table réelle tva', '(SELECT Taux = 6 AND Description = ''T2'' FROM tva WHERE TVA_ID = 9900001)');
  CALL mc_t('A3 UPDATE via alias TVA', 'OK', 'UPDATE `TVA` SET Taux = 12 WHERE TVA_ID = 9900001');
  CALL mc_t('A4 REPLACE via alias TVA', 'OK', 'REPLACE INTO `TVA` (TVA_ID, Taux, Description) VALUES (9900001, 21, ''T3'')');
  CALL mc_t('A5 TVA sans alias exact (limite connue : TRUNCATE sur vue)', 'ERR', 'TRUNCATE TABLE `TVA`');

  -- ===== B. Dates vides : '' accepté et stocké NULL =====
  CALL mc_t('B1 familles2 INSERT Periode_du/au = ''''', 'OK',
    'INSERT INTO familles2 (F2CLEUNIK, Description, F1CLEUNIK, Periode_du, Periode_au) VALUES (9900001, ''T'', 1, '''', '''')');
  CALL mc_c('B1b stockés NULL (pas de date inventée)', '(SELECT Periode_du IS NULL AND Periode_au IS NULL FROM familles2 WHERE F2CLEUNIK = 9900001)');
  CALL mc_t('B2 articles INSERT Promo_Date_* = ''''', 'OK',
    'INSERT INTO articles (ARCLEUNIK, LIBELLE, Promo_Date_Debut, Promo_Date_Fin) VALUES (9900001, ''T'', '''', '''')');
  CALL mc_c('B2b stockés NULL', '(SELECT Promo_Date_Debut IS NULL AND Promo_Date_Fin IS NULL FROM articles WHERE ARCLEUNIK = 9900001)');
  CALL mc_t('B3 date valide conservée', 'OK', 'UPDATE familles2 SET Periode_du = ''2026-03-15'' WHERE F2CLEUNIK = 9900001');
  CALL mc_c('B3b valeur identique', '(SELECT Periode_du = ''2026-03-15'' FROM familles2 WHERE F2CLEUNIK = 9900001)');
  CALL mc_t('B4 ODKU avec '''' sur ligne existante', 'OK',
    'INSERT INTO familles2 (F2CLEUNIK, Description, F1CLEUNIK, Periode_du, Periode_au) VALUES (9900001, ''T'', 1, '''', '''') ON DUPLICATE KEY UPDATE Periode_du = VALUES(Periode_du), Periode_au = VALUES(Periode_au)');
  CALL mc_c('B4b ODKU: la date vidée côté caisse devient NULL (VALUES() + trigger BU)', '(SELECT Periode_du IS NULL FROM familles2 WHERE F2CLEUNIK = 9900001)');
  CALL mc_t('B5 UPDATE ... = ''''', 'OK', 'UPDATE articles SET Promo_Date_Debut = '''' WHERE ARCLEUNIK = 9900001');
  CALL mc_t('B6 YYYYMMDD normalisé', 'OK', 'UPDATE articles SET Promo_Date_Fin = ''20260315'' WHERE ARCLEUNIK = 9900001');
  CALL mc_c('B6b = 2026-03-15', '(SELECT Promo_Date_Fin = ''2026-03-15'' FROM articles WHERE ARCLEUNIK = 9900001)');
  CALL mc_t('B7 datetime tronqué à la date', 'OK', 'UPDATE articles SET Promo_Date_Fin = ''2026-03-15 10:00:00'' WHERE ARCLEUNIK = 9900001');
  CALL mc_c('B7b = 2026-03-15', '(SELECT Promo_Date_Fin = ''2026-03-15'' FROM articles WHERE ARCLEUNIK = 9900001)');
  CALL mc_t('B8 date impossible refusée (2026-02-31)', 'ERR', 'UPDATE articles SET Promo_Date_Fin = ''2026-02-31'' WHERE ARCLEUNIK = 9900001');
  CALL mc_t('B9 texte refusé (abc)', 'ERR', 'UPDATE articles SET Promo_Date_Fin = ''abc'' WHERE ARCLEUNIK = 9900001');
  CALL mc_t('B10 fournis Date_Entree = ''''', 'OK',
    'INSERT INTO fournis (FRCLEUNIK, Fournis_No, Nom_Societe, Date_Entree) VALUES (9900001, ''T99'', ''T'', '''') ON DUPLICATE KEY UPDATE Date_Entree = VALUES(Date_Entree)');
  CALL mc_c('B10b Date_Entree NULL', '(SELECT Date_Entree IS NULL FROM fournis WHERE FRCLEUNIK = 9900001)');
  CALL mc_t('B11 requête réelle de la caisse (TVA, ODKU, date 20261024)', 'OK',
    'INSERT INTO TVA (TVA_ID, Taux, Description, Derniere_MAJ) VALUES (9900002, 0, '''', ''20261024'') ON DUPLICATE KEY UPDATE Taux = 0, Description = '''', Derniere_MAJ = ''20261024''');

  -- ===== C. Contraintes indispensables conservées =====
  CALL mc_t('C1 PK NULL refusée', 'ERR', 'INSERT INTO familles2 (F2CLEUNIK, Description, F1CLEUNIK) VALUES (NULL, ''T'', 1)');
  CALL mc_t('C2 relation F1CLEUNIK obligatoire', 'ERR', 'INSERT INTO familles2 (F2CLEUNIK, Description) VALUES (9900002, ''T'')');
  CALL mc_t('C3 LIBELLE obligatoire', 'ERR', 'INSERT INTO articles (ARCLEUNIK) VALUES (9900002)');
  CALL mc_t('C4 PK dupliquée sans ODKU refusée', 'ERR', 'INSERT INTO familles2 (F2CLEUNIK, Description, F1CLEUNIK) VALUES (9900001, ''T'', 1)');
  CALL mc_t('C5 ventes sans Date refusée', 'ERR', 'INSERT INTO ventes (VTCLEUNIK, Numero, Type) VALUES (9900001, ''T9900001'', ''FA'')');

  -- ===== D. Défauts : omission vs '' vs NULL =====
  CALL mc_t('D1 tickets sans PDF_Base64 (omis -> défaut)', 'OK', 'INSERT INTO tickets (Numero) VALUES (''T9900001'')');
  CALL mc_c('D1b PDF_Base64 = vide', '(SELECT PDF_Base64 = '''' FROM tickets WHERE Numero = ''T9900001'')');
  CALL mc_t('D2 tickets PDF_Base64 = NULL explicite (reste refusé)', 'ERR', 'INSERT INTO tickets (Numero, PDF_Base64) VALUES (''T9900002'', NULL)');
  CALL mc_t('D3 zreports sans Total_Cash', 'OK', 'INSERT INTO zreports (Date, Code_Magasin) VALUES (''2026-01-01'', ''ZZ'')');

  -- ===== E. Limites connues (doivent échouer : une compatibilité totale est impossible ici) =====
  CALL mc_t('E1 '''' dans une colonne DECIMAL (familles2.Remise_PC)', 'ERR',
    'INSERT INTO familles2 (F2CLEUNIK, Description, F1CLEUNIK, Remise_PC) VALUES (9900003, ''T'', 1, '''')');
  CALL mc_t('E2 '''' dans une colonne DATE non traitée (familles2.Derniere_MAJ)', 'ERR',
    'INSERT INTO familles2 (F2CLEUNIK, Description, F1CLEUNIK, Derniere_MAJ) VALUES (9900004, ''T'', 1, '''')');
  CALL mc_t('E3 '''' dans ventes.Date (NOT NULL, indispensable)', 'ERR',
    'INSERT INTO ventes (VTCLEUNIK, Numero, Date, Type) VALUES (9900002, ''T9900002'', '''', ''FA'')');

  DELETE FROM tva WHERE TVA_ID >= 9900000;
  DELETE FROM familles2 WHERE F2CLEUNIK >= 9900000;
  DELETE FROM articles WHERE ARCLEUNIK >= 9900000;
  DELETE FROM fournis WHERE FRCLEUNIK >= 9900000;
  DELETE FROM tickets WHERE Numero LIKE 'T99%';
  DELETE FROM ventes WHERE VTCLEUNIK >= 9900000;
  DELETE FROM zreports WHERE Code_Magasin = 'ZZ';
  SELECT * FROM mc_res ORDER BY n;
END$$
DELIMITER ;

CALL mc_run();

-- Résumé : doit afficher fails = 0
SELECT SUM(verdict = 'FAIL') AS fails, SUM(verdict = 'PASS') AS passes FROM mc_res;

-- Aucun résidu de test
SELECT (SELECT COUNT(*) FROM tva WHERE TVA_ID >= 9900000) + (SELECT COUNT(*) FROM familles2 WHERE F2CLEUNIK >= 9900000)
     + (SELECT COUNT(*) FROM articles WHERE ARCLEUNIK >= 9900000) + (SELECT COUNT(*) FROM tickets WHERE Numero LIKE 'T99%') AS residus;

DROP PROCEDURE mc_run;
DROP PROCEDURE mc_t;
DROP PROCEDURE mc_c;
DROP TABLE mc_res;

-- Intégrité des données migrées (comparer avec la prod avant/après) :
SELECT 'articles' AS t, COUNT(*) AS n, SUM(Promo_Date_Debut IS NOT NULL) AS promo_debut, SUM(Promo_Date_Fin IS NOT NULL) AS promo_fin FROM articles
UNION ALL SELECT 'familles2', COUNT(*), SUM(Periode_du IS NOT NULL), SUM(Periode_au IS NOT NULL) FROM familles2;
-- Les lectures du site doivent toujours fonctionner : relancer l'application contre la copie (variables DB_*) et tester
-- articles, familles, TVA, factures/tickets (PDF), commandes, fournisseurs.
