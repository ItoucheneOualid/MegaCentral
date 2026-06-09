-- Création de la table des mouvements de stock
-- Pour le TFE - Système de gestion de stock complet

CREATE TABLE IF NOT EXISTS mouvements_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_id INT NOT NULL,
  type_mouvement ENUM('SORTIE', 'AJUSTEMENT_POSITIF', 'AJUSTEMENT_NEGATIF', 'RETOUR') NOT NULL,
  quantite DECIMAL(12,2) NOT NULL,
  quantite_avant DECIMAL(12,2) NOT NULL,
  quantite_apres DECIMAL(12,2) NOT NULL,
  raison VARCHAR(255),
  reference_document VARCHAR(100),
  utilisateur_id INT,
  date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  magasin_id INT NOT NULL,
  article_id INT NOT NULL,
  
  FOREIGN KEY (stock_id) REFERENCES stock_magasin(id) ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_stock_date (stock_id, date_mouvement),
  INDEX idx_magasin_article (magasin_id, article_id),
  INDEX idx_date_mouvement (date_mouvement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de quelques mouvements d'exemple pour démonstration
INSERT IGNORE INTO mouvements_stock (
  stock_id, type_mouvement, quantite, quantite_avant, quantite_apres, 
  raison, utilisateur_id, magasin_id, article_id
) VALUES 
(1, 'AJUSTEMENT_POSITIF', 64.00, 0.00, 64.00, 'Stock initial', 11, 1, 1),
(2, 'AJUSTEMENT_POSITIF', 50.00, 0.00, 50.00, 'Stock initial', 11, 1, 2),
(3, 'AJUSTEMENT_POSITIF', 75.00, 0.00, 75.00, 'Stock initial', 11, 2, 1),
(4, 'AJUSTEMENT_POSITIF', 25.00, 0.00, 25.00, 'Stock initial', 11, 2, 3),
(5, 'AJUSTEMENT_POSITIF', 30.00, 0.00, 30.00, 'Stock initial', 11, 3, 2),
(6, 'AJUSTEMENT_POSITIF', 60.00, 0.00, 60.00, 'Stock initial', 11, 3, 1);
