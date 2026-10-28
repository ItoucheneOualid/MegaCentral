-- =====================================================================
-- 14_migration_code_barres.sql — complément de 10 à 13
-- Erreur constatée à l'export : 1406 Data too long for column 'Code_Barres' (code de 16 caractères, colonne VARCHAR(15)).
-- On agrandit seulement la taille : aucune donnée existante n'est modifiée, les index (non uniques) sont conservés.
-- barcodes.CodeBarre reçoit les mêmes codes : même taille.
-- Rejouable.
-- =====================================================================
USE idmegacentral_v14;

ALTER TABLE articles
  MODIFY COLUMN Code_Barres VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;
ALTER TABLE barcodes
  MODIFY COLUMN CodeBarre VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
