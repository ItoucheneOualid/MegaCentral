-- Table pour les mouvements de stock
CREATE TABLE mouvements_stock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  magasin_id INT NOT NULL,
  article_id INT NOT NULL,
  type_mouvement ENUM('ENTREE', 'SORTIE', 'TRANSFERT_SORTANT', 'TRANSFERT_ENTRANT', 'INVENTAIRE_PLUS', 'INVENTAIRE_MOINS', 'PERTE', 'CORRECTION') NOT NULL,
  quantite DECIMAL(10,2) NOT NULL,
  prix_unitaire DECIMAL(10,2),
  reference_document VARCHAR(50), -- Numéro de facture, bon de livraison, etc.
  motif VARCHAR(200),
  utilisateur_id INT,
  date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP,
  stock_avant DECIMAL(10,2),
  stock_apres DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (magasin_id) REFERENCES magasin(id),
  FOREIGN KEY (article_id) REFERENCES articles(ARCLEUNIK),
  INDEX idx_magasin_article (magasin_id, article_id),
  INDEX idx_date_mouvement (date_mouvement),
  INDEX idx_type_mouvement (type_mouvement)
);

-- Table pour les transferts de stock entre magasins
CREATE TABLE transferts_stock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  magasin_source_id INT NOT NULL,
  magasin_destination_id INT NOT NULL,
  article_id INT NOT NULL,
  quantite DECIMAL(10,2) NOT NULL,
  statut ENUM('EN_COURS', 'VALIDE', 'ANNULE') DEFAULT 'EN_COURS',
  date_transfert DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_validation DATETIME NULL,
  utilisateur_source_id INT,
  utilisateur_validation_id INT,
  motif VARCHAR(200),
  reference_document VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (magasin_source_id) REFERENCES magasin(id),
  FOREIGN KEY (magasin_destination_id) REFERENCES magasin(id),
  FOREIGN KEY (article_id) REFERENCES articles(ARCLEUNIK),
  INDEX idx_transfert (magasin_source_id, magasin_destination_id, statut)
);

-- Table pour les sessions d'inventaire
CREATE TABLE inventaires (
  id INT PRIMARY KEY AUTO_INCREMENT,
  magasin_id INT NOT NULL,
  article_id INT NOT NULL,
  date_inventaire DATETIME DEFAULT CURRENT_TIMESTAMP,
  stock_theorique DECIMAL(10,2) NOT NULL,
  stock_reel DECIMAL(10,2) NOT NULL,
  ecart DECIMAL(10,2) GENERATED ALWAYS AS (stock_reel - stock_theorique) STORED,
  statut ENUM('EN_COURS', 'VALIDE', 'ANNULE') DEFAULT 'EN_COURS',
  utilisateur_id INT,
  commentaire TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (magasin_id) REFERENCES magasin(id),
  FOREIGN KEY (article_id) REFERENCES articles(ARCLEUNIK),
  INDEX idx_inventaire (magasin_id, statut, date_inventaire)
);

-- Vue pour le suivi des stocks actuels avec alertes
CREATE VIEW vue_stocks_avec_alertes AS
SELECT 
  sm.id,
  sm.magasin_id,
  m.Nom_Magasin as nom_magasin,
  sm.article_id,
  a.LIBELLE as libelle_article,
  a.Code_Barres as code_barres,
  sm.quantite_stock as quantite_actuelle,
  sm.seuil_min,
  sm.seuil_max,
  CASE 
    WHEN sm.seuil_min IS NOT NULL AND sm.quantite_stock <= sm.seuil_min THEN 'CRITIQUE'
    WHEN sm.seuil_min IS NOT NULL AND sm.quantite_stock <= (sm.seuil_min * 1.2) THEN 'FAIBLE'
    WHEN sm.seuil_max IS NOT NULL AND sm.quantite_stock >= sm.seuil_max THEN 'EXCESSIF'
    ELSE 'NORMAL'
  END as niveau_alerte,
  DATEDIFF(CURRENT_DATE, MAX(ms.date_mouvement)) as jours_dernier_mouvement
FROM stock_magasin sm
LEFT JOIN magasin m ON sm.magasin_id = m.id
LEFT JOIN articles a ON sm.article_id = a.ARCLEUNIK
LEFT JOIN mouvements_stock ms ON sm.magasin_id = ms.magasin_id AND sm.article_id = ms.article_id
GROUP BY sm.id, sm.magasin_id, sm.article_id, sm.quantite_stock, sm.seuil_min, sm.seuil_max, m.Nom_Magasin, a.LIBELLE, a.Code_Barres;
