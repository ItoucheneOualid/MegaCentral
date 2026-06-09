-- =====================================================
-- CORRECTIONS PROFESSIONNELLES BASE DE DONNÉES
-- =====================================================

-- 1. CRÉATION DE STOCKS POUR TOUS LES ARTICLES MANQUANTS
-- =====================================================
-- Pour chaque article qui n'a pas de stock, créer une entrée avec quantité 0
INSERT IGNORE INTO stock_magasin (magasin_id, article_id, quantite_stock, seuil_min, seuil_max)
SELECT 
    m.id as magasin_id,
    a.ARCLEUNIK as article_id,
    0.00 as quantite_stock,
    5.00 as seuil_min,    -- Seuil par défaut
    100.00 as seuil_max   -- Seuil par défaut
FROM articles a
CROSS JOIN magasin m
WHERE a.ARCLEUNIK NOT IN (
    SELECT DISTINCT article_id 
    FROM stock_magasin 
    WHERE article_id IS NOT NULL
);

-- 2. AJOUT DE CONTRAINTES POUR LA COHÉRENCE
-- =====================================================
-- Contrainte FOREIGN KEY pour stock_magasin.article_id
ALTER TABLE stock_magasin 
ADD CONSTRAINT fk_stock_article 
FOREIGN KEY (article_id) REFERENCES articles(ARCLEUNIK) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Contrainte FOREIGN KEY pour stock_magasin.magasin_id  
ALTER TABLE stock_magasin 
ADD CONSTRAINT fk_stock_magasin 
FOREIGN KEY (magasin_id) REFERENCES magasin(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Contrainte UNIQUE pour éviter les doublons (même article/même magasin)
ALTER TABLE stock_magasin 
ADD CONSTRAINT unique_stock_article_magasin 
UNIQUE (magasin_id, article_id);

-- 3. CRÉATION D'INDEX POUR LES PERFORMANCES
-- =====================================================
-- Index pour les recherches rapides par article
CREATE INDEX idx_stock_article ON stock_magasin(article_id);

-- Index pour les recherches rapides par magasin
CREATE INDEX idx_stock_magasin ON stock_magasin(magasin_id);

-- Index composite pour les recherches par magasin+article
CREATE INDEX idx_stock_magasin_article ON stock_magasin(magasin_id, article_id);

-- Index pour les alertes (stocks bas)
CREATE INDEX idx_stock_seuil_min ON stock_magasin(seuil_min, quantite_stock);

-- 4. VUE AMÉLIORÉE POUR LA GESTION DES STOCKS
-- =====================================================
DROP VIEW IF EXISTS vue_stocks_complets;

CREATE VIEW vue_stocks_complets AS
SELECT 
    sm.id as stock_id,
    sm.magasin_id,
    m.Code_Magasin as code_magasin,
    m.Nom_Magasin as nom_magasin,
    sm.article_id,
    a.LIBELLE as libelle_article,
    a.Code_Barres as code_barres,
    a.Prix_TTC1 as prix_vente_ttc,
    a.Prix_HT1 as prix_achat_ht,
    sm.quantite_stock,
    sm.seuil_min,
    sm.seuil_max,
    -- Calcul du niveau d'alerte
    CASE 
        WHEN sm.seuil_min IS NOT NULL AND sm.quantite_stock <= sm.seuil_min THEN 'CRITIQUE'
        WHEN sm.seuil_min IS NOT NULL AND sm.quantite_stock <= (sm.seuil_min * 1.2) THEN 'FAIBLE'
        WHEN sm.seuil_max IS NOT NULL AND sm.quantite_stock >= sm.seuil_max THEN 'EXCESSIF'
        ELSE 'NORMAL'
    END as niveau_alerte,
    -- Calcul de la valeur du stock
    (sm.quantite_stock * a.Prix_TTC1) as valeur_stock_ttc,
    -- Calcul de la marge potentielle
    (a.Prix_TTC1 - COALESCE(a.Prix_HT1, 0)) as marge_unitaire,
    (sm.quantite_stock * (a.Prix_TTC1 - COALESCE(a.Prix_HT1, 0))) as marge_totale,
    -- Date de dernière mise à jour
    COALESCE(sm.updated_at, NOW()) as date_maj,
    -- Calcul du taux de rotation (basé sur les ventes des 30 derniers jours)
    COALESCE(
        (SELECT SUM(lv.quantite) 
         FROM ligne_vente lv 
         JOIN ventes v ON lv.VCLEUNIK = v.VCLEUNIK 
         WHERE lv.ARCLEUNIK = sm.article_id 
         AND v.Magasin = sm.magasin_id 
         AND v.Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ), 0
    ) as ventes_30_jours
FROM stock_magasin sm
LEFT JOIN magasin m ON sm.magasin_id = m.id
LEFT JOIN articles a ON sm.article_id = a.ARCLEUNIK
WHERE sm.article_id IS NOT NULL
ORDER BY m.Nom_Magasin, a.LIBELLE;

-- 5. VUE POUR LES ARTICLES SANS STOCK
-- =====================================================
CREATE VIEW vue_articles_sans_stock AS
SELECT 
    a.ARCLEUNIK as article_id,
    a.LIBELLE as libelle_article,
    a.Code_Barres as code_barres,
    a.Prix_TTC1 as prix_vente_ttc,
    'SANS_STOCK' as statut
FROM articles a
WHERE a.ARCLEUNIK NOT IN (
    SELECT DISTINCT article_id 
    FROM stock_magasin 
    WHERE article_id IS NOT NULL
)
ORDER BY a.LIBELLE;

-- 6. TRIGGER POUR MAINTENIR LA COHÉRENCE
-- =====================================================
-- Trigger lors de l'ajout d'un article
DELIMITER //
CREATE TRIGGER after_article_insert
AFTER INSERT ON articles
FOR EACH ROW
BEGIN
    -- Créer automatiquement un stock à 0 pour chaque magasin
    INSERT IGNORE INTO stock_magasin (magasin_id, article_id, quantite_stock, seuil_min, seuil_max)
    SELECT id, NEW.ARCLEUNIK, 0.00, 5.00, 100.00
    FROM magasin;
END//
DELIMITER ;

-- Trigger lors de la suppression d'un article
DELIMITER //
CREATE TRIGGER before_article_delete
BEFORE DELETE ON articles
FOR EACH ROW
BEGIN
    -- Supprimer automatiquement tous les stocks de cet article
    DELETE FROM stock_magasin WHERE article_id = OLD.ARCLEUNIK;
END//
DELIMITER ;

-- 7. PROCÉDURE POUR LA MISE À JOUR DES STOCKS
-- =====================================================
DELIMITER //
CREATE PROCEDURE maj_stock_complet(
    IN p_article_id INT,
    IN p_magasin_id INT,
    IN p_quantite DECIMAL(10,2),
    IN p_seuil_min DECIMAL(10,2),
    IN p_seuil_max DECIMAL(10,2),
    IN p_utilisateur VARCHAR(100)
)
BEGIN
    DECLARE v_stock_existe INT;
    
    -- Vérifier si le stock existe déjà
    SELECT COUNT(*) INTO v_stock_existe
    FROM stock_magasin 
    WHERE article_id = p_article_id AND magasin_id = p_magasin_id;
    
    IF v_stock_existe > 0 THEN
        -- Mettre à jour le stock existant
        UPDATE stock_magasin 
        SET quantite_stock = p_quantite,
            seuil_min = p_seuil_min,
            seuil_max = p_seuil_max,
            updated_at = NOW()
        WHERE article_id = p_article_id AND magasin_id = p_magasin_id;
    ELSE
        -- Créer un nouveau stock
        INSERT INTO stock_magasin 
        (magasin_id, article_id, quantite_stock, seuil_min, seuil_max, created_at, updated_at)
        VALUES (p_magasin_id, p_article_id, p_quantite, p_seuil_min, p_seuil_max, NOW(), NOW());
    END IF;
    
    -- Journaliser l'action
    INSERT INTO journal_stocks (article_id, magasin_id, action, quantite_ancienne, quantite_nouvelle, utilisateur, date_action)
    VALUES (p_article_id, p_magasin_id, 'MAJ', 
            COALESCE((SELECT quantite_stock FROM stock_magasin WHERE article_id = p_article_id AND magasin_id = p_magasin_id), 0),
            p_quantite, p_utilisateur, NOW());
END//
DELIMITER ;

-- 8. TABLE DE JOURNALISATION DES MODIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    magasin_id INT NOT NULL,
    action ENUM('CREATION', 'MAJ', 'SUPPRESSION') NOT NULL,
    quantite_ancienne DECIMAL(10,2),
    quantite_nouvelle DECIMAL(10,2),
    utilisateur VARCHAR(100),
    date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
    motif VARCHAR(200),
    
    FOREIGN KEY (article_id) REFERENCES articles(ARCLEUNIK),
    FOREIGN KEY (magasin_id) REFERENCES magasin(id),
    INDEX idx_journal_date (date_action),
    INDEX idx_journal_article (article_id)
);

-- =====================================================
-- FIN DES CORRECTIONS PROFESSIONNELLES
-- =====================================================
