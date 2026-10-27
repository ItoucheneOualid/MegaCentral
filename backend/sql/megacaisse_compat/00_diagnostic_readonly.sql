-- =====================================================================
-- 00_diagnostic_readonly.sql  — LECTURE SEULE (aucune écriture)
-- À exécuter sur Aiven (idmegacentral_v14) avec avnadmin, puis me renvoyer
-- les résultats. Ne modifie rien.
-- =====================================================================

-- 1. Version, mode SQL, sensibilité à la casse, droits de création de triggers/fonctions
SELECT VERSION() AS version,
       @@GLOBAL.sql_mode  AS sql_mode_global,
       @@SESSION.sql_mode AS sql_mode_session,
       @@lower_case_table_names AS lower_case_table_names,   -- 0 attendu (cause de l'erreur TVA)
       @@log_bin_trust_function_creators AS trust_function_creators, -- doit être 1 pour créer fonctions/triggers sans SUPER
       @@character_set_database AS charset_db, @@collation_database AS collation_db;

-- 2. Objets existants et leur casse EXACTE (tables + vues)
SELECT TABLE_NAME, TABLE_TYPE, ENGINE, TABLE_ROWS,
       ROUND((DATA_LENGTH + INDEX_LENGTH) / 1048576, 1) AS taille_mo
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'idmegacentral_v14'
ORDER BY TABLE_NAME;

-- 3. Structure réelle : colonnes, nullabilité, défauts, extras (auto_increment, generated)
SELECT TABLE_NAME, ORDINAL_POSITION, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE,
       COLUMN_DEFAULT, EXTRA, COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'idmegacentral_v14'
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 4. Colonnes NOT NULL sans défaut (candidates à l'analyse « facultatif ou pas »)
SELECT c.TABLE_NAME, c.COLUMN_NAME, c.COLUMN_TYPE, c.COLUMN_KEY
FROM information_schema.COLUMNS c
JOIN information_schema.TABLES t USING (TABLE_SCHEMA, TABLE_NAME)
WHERE c.TABLE_SCHEMA = 'idmegacentral_v14' AND t.TABLE_TYPE = 'BASE TABLE'
  AND c.IS_NULLABLE = 'NO' AND c.COLUMN_DEFAULT IS NULL
  AND c.EXTRA NOT LIKE '%auto_increment%' AND c.EXTRA NOT LIKE '%GENERATED%'
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;

-- 5. Toutes les colonnes temporelles (DATE/TIME/DATETIME/TIMESTAMP) : celles qui peuvent recevoir '' un jour
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'idmegacentral_v14'
  AND DATA_TYPE IN ('date','time','datetime','timestamp','year')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 6. Clés, index uniques, clés étrangères, CHECK, triggers, routines, vues existants
SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = 'idmegacentral_v14'
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;

SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING, DEFINER
FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = 'idmegacentral_v14';

SELECT ROUTINE_TYPE, ROUTINE_NAME, DEFINER FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'idmegacentral_v14';

SELECT TABLE_NAME, VIEW_DEFINITION, SECURITY_TYPE, IS_UPDATABLE
FROM information_schema.VIEWS WHERE TABLE_SCHEMA = 'idmegacentral_v14';

-- 7. Droits du compte d'export
SHOW GRANTS FOR 'dev_megacaisse'@'%';

-- 8. Données déjà présentes qui poseraient problème lors d'un changement de type
SELECT 'articles.Promo_Date_Debut zéro' AS controle, COUNT(*) AS n FROM articles WHERE Promo_Date_Debut = '0000-00-00'
UNION ALL SELECT 'articles.Promo_Date_Fin zéro', COUNT(*) FROM articles WHERE Promo_Date_Fin = '0000-00-00'
UNION ALL SELECT 'familles2.Periode_du zéro', COUNT(*) FROM familles2 WHERE Periode_du = '0000-00-00'
UNION ALL SELECT 'familles2.Periode_au zéro', COUNT(*) FROM familles2 WHERE Periode_au = '0000-00-00';

-- 9. CE QUE L'EXPORT ENVOIE RÉELLEMENT (performance_schema, si activé : SHOW VARIABLES LIKE 'performance_schema')
-- 9a. Erreurs par type pour le compte d'export (1292 date, 1366 nombre, 1048 NULL interdit, 1364 pas de défaut, 1146 table absente)
SELECT USER, ERROR_NUMBER, ERROR_NAME, SUM_ERROR_RAISED, LAST_SEEN
FROM performance_schema.events_errors_summary_by_user_by_error
WHERE USER = 'dev_megacaisse' AND SUM_ERROR_RAISED > 0
ORDER BY SUM_ERROR_RAISED DESC;

-- 9b. Gabarits des requêtes en erreur (tables, colonnes, forme INSERT / ON DUPLICATE / UPDATE / REPLACE)
SELECT SCHEMA_NAME, SUM_ERRORS, COUNT_STAR, FIRST_SEEN, LAST_SEEN, DIGEST_TEXT
FROM performance_schema.events_statements_summary_by_digest
WHERE SUM_ERRORS > 0 AND LAST_SEEN > NOW() - INTERVAL 7 DAY
ORDER BY LAST_SEEN DESC
LIMIT 100;

-- 9c. Gabarits de TOUTES les requêtes d'écriture (INSERT sans liste de colonnes ? REPLACE ? TRUNCATE ? DDL ?)
SELECT SCHEMA_NAME, COUNT_STAR, SUM_ERRORS, LEFT(DIGEST_TEXT, 600) AS gabarit
FROM performance_schema.events_statements_summary_by_digest
WHERE (DIGEST_TEXT LIKE 'INSERT%' OR DIGEST_TEXT LIKE 'REPLACE%' OR DIGEST_TEXT LIKE 'UPDATE%'
    OR DIGEST_TEXT LIKE 'DELETE%' OR DIGEST_TEXT LIKE 'TRUNCATE%' OR DIGEST_TEXT LIKE 'ALTER%'
    OR DIGEST_TEXT LIKE 'DROP%' OR DIGEST_TEXT LIKE 'CREATE%' OR DIGEST_TEXT LIKE 'LOAD%')
ORDER BY LAST_SEEN DESC
LIMIT 200;
