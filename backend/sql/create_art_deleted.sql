-- Journal des articles supprimés (structure identique à MegaCaisse).
-- ARCleunik : identifiant de l'article supprimé (pas de clé étrangère : l'article n'existe plus).
CREATE TABLE IF NOT EXISTS `ART_Deleted` (
  `ARCleunik` varchar(100) NOT NULL,
  `Date_deleted` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ARCleunik`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
