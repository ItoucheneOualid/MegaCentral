-- Migration: Consolider la gestion des stocks dans une seule table `stock_magasin`
-- INSTRUCTIONS:
-- 1) Faites une sauvegarde complète de la base (mysqldump) avant d'exécuter.
-- 2) Remplacez __DEFAULT_MAGASIN_ID__ par l'id du magasin par défaut (si mono-magasin)
-- 3) Exécutez ce fichier dans votre client MySQL: SOURCE migrate_stock_consolidation.sql;

-- 1) Ajouter le flag manage_stock dans la table articles (si absent)
ALTER TABLE `articles`
  ADD COLUMN IF NOT EXISTS `manage_stock` TINYINT(1) NOT NULL DEFAULT 1;

-- 2) Créer la table consolidée stock_magasin (une ligne par article x magasin)
CREATE TABLE IF NOT EXISTS `stock_magasin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `article_id` INT NOT NULL,
  `magasin_id` INT NOT NULL,
  `quantite` INT NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_stock_article` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_magasin` FOREIGN KEY (`magasin_id`) REFERENCES `magasin`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_article_magasin` (`article_id`, `magasin_id`),
  INDEX (`magasin_id`),
  INDEX (`article_id`)
);

-- 3) Backfill: insérer quantités existantes depuis `articles` vers `stock_magasin`
-- Remplacez __DEFAULT_MAGASIN_ID__ par l'id du magasin à utiliser pour les quantités stockées dans `articles`.
INSERT INTO `stock_magasin` (`article_id`, `magasin_id`, `quantite`, `updated_at`)
SELECT `id` as article_id, __DEFAULT_MAGASIN_ID__ as magasin_id, COALESCE(`quantite_stock`,0) as quantite, NOW()
FROM `articles`
WHERE COALESCE(`quantite_stock`,0) > 0
ON DUPLICATE KEY UPDATE `quantite` = VALUES(`quantite`), `updated_at` = VALUES(`updated_at`);

-- 4) Optionnel: pour les produits non gérés par stock, mettre manage_stock=0
-- UPDATE articles SET manage_stock = 0 WHERE /* condition pour produits non gérés */;

-- 5) Vérifications rapides
SELECT COUNT(*) AS total_articles FROM articles;
SELECT COUNT(*) AS total_stock_rows FROM stock_magasin;
SELECT SUM(quantite) AS total_stock_quantity FROM stock_magasin;

-- FIN
