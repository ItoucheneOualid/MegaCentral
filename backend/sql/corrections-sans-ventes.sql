-- =====================================================
-- CORRECTIONS PROFESSIONNELLES SANS DÉPENDANCE AUX VENTES
-- =====================================================

-- 1. CRÉATION DE STOCKS POUR TOUS LES ARTICLES MANQUANTS
-- =====================================================
INSERT IGNORE INTO stock_magasin (magasin_id, article_id, quantite_stock, seuil_min, seuil_max)
SELECT 
    m.id as magasin_id,
    a.ARCLEUNIK as article_id,
    0.00 as quantite_stock,
    5.00 as seuil_min,
    100.00 as seuil_max
FROM articles a
CROSS JOIN magasin m
WHERE a.ARCLEUNIK NOT IN (
    SELECT DISTINCT article_id 
    FROM stock_magasin 
    WHERE article_id IS NOT NULL
);

-- 2. AJOUT D'INDEX POUR LES PERFORMANCES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_stock_article ON stock_magasin(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_magasin ON stock_magasin(magasin_id);
CREATE INDEX IF NOT EXISTS idx_stock_magasin_article ON stock_magasin(magasin_id, article_id);
CREATE INDEX IF NOT EXISTS idx_stock_seuil_min ON stock_magasin(seuil_min, quantite_stock);

-- 3. VUE AMÉLIORÉE POUR LA GESTION DES STOCKS
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
    COALESCE(a.Prix_Achat_HT, 0) as prix_achat_ht,
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
    (a.Prix_TTC1 - COALESCE(a.Prix_Achat_HT, 0)) as marge_unitaire,
    (sm.quantite_stock * (a.Prix_TTC1 - COALESCE(a.Prix_Achat_HT, 0))) as marge_totale,
    -- Date actuelle comme date de mise à jour
    NOW() as date_maj,
    -- Rotation simulée (basé sur 0 car pas de ventes)
    0 as ventes_30_jours
FROM stock_magasin sm
LEFT JOIN magasin m ON sm.magasin_id = m.id
LEFT JOIN articles a ON sm.article_id = a.ARCLEUNIK
WHERE sm.article_id IS NOT NULL
ORDER BY m.Nom_Magasin, a.LIBELLE;

-- 4. VUE POUR LES ARTICLES SANS STOCK
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

-- 5. VUE POUR LES STATISTIQUES GLOBALES
-- =====================================================
CREATE VIEW vue_statistiques_globales AS
SELECT 
    COUNT(*) as total_articles,
    COUNT(CASE WHEN niveau_alerte = 'CRITIQUE' THEN 1 END) as alertes_critiques,
    COUNT(CASE WHEN niveau_alerte = 'FAIBLE' THEN 1 END) as alertes_faibles,
    COUNT(CASE WHEN niveau_alerte = 'NORMAL' THEN 1 END) as stocks_normaux,
    COUNT(CASE WHEN niveau_alerte = 'EXCESSIF' THEN 1 END) as stocks_excessifs,
    SUM(quantite_stock) as quantite_totale,
    SUM(valeur_stock_ttc) as valeur_totale_ttc,
    SUM(marge_totale) as marge_totale,
    SUM(ventes_30_jours) as ventes_totales_30_jours
FROM vue_stocks_complets;

-- 6. VUE POUR LES STATISTIQUES PAR MAGASIN
-- =====================================================
CREATE VIEW vue_statistiques_magasin AS
SELECT 
    nom_magasin,
    COUNT(*) as nombre_articles,
    COUNT(CASE WHEN niveau_alerte = 'CRITIQUE' THEN 1 END) as alertes_critiques,
    COUNT(CASE WHEN niveau_alerte = 'FAIBLE' THEN 1 END) as alertes_faibles,
    COUNT(CASE WHEN niveau_alerte = 'NORMAL' THEN 1 END) as stocks_normaux,
    COUNT(CASE WHEN niveau_alerte = 'EXCESSIF' THEN 1 END) as stocks_excessifs,
    SUM(quantite_stock) as quantite_totale,
    SUM(valeur_stock_ttc) as valeur_totale_ttc,
    SUM(marge_totale) as marge_totale,
    SUM(ventes_30_jours) as ventes_totales_30_jours
FROM vue_stocks_complets
GROUP BY nom_magasin
ORDER BY nom_magasin;

-- 7. VUE POUR LES ALERTES ACTIVES
-- =====================================================
CREATE VIEW vue_alertes_actives AS
SELECT 
    nom_magasin,
    libelle_article,
    code_barres,
    quantite_stock,
    seuil_min,
    niveau_alerte,
    valeur_stock_ttc,
    marge_totale,
    ventes_30_jours,
    -- Priorité de traitement
    CASE 
        WHEN niveau_alerte = 'CRITIQUE' THEN 1
        WHEN niveau_alerte = 'FAIBLE' THEN 2
        WHEN niveau_alerte = 'EXCESSIF' THEN 3
        ELSE 4
    END as priorite
FROM vue_stocks_complets
WHERE niveau_alerte IN ('CRITIQUE', 'FAIBLE', 'EXCESSIF')
ORDER BY priorite, nom_magasin, libelle_article;

-- 8. VUE POUR LES TOP ARTICLES PAR VALEUR DE STOCK
-- =====================================================
CREATE VIEW vue_top_valeur_stocks AS
SELECT 
    libelle_article,
    code_barres,
    SUM(quantite_stock) as quantite_totale,
    SUM(valeur_stock_ttc) as valeur_totale_ttc,
    COUNT(DISTINCT nom_magasin) as nombre_magasins,
    AVG(valeur_stock_ttc) as valeur_moyenne_ttc
FROM vue_stocks_complets
GROUP BY libelle_article, code_barres
ORDER BY valeur_totale_ttc DESC
LIMIT 20;

-- =====================================================
-- FIN DES CORRECTIONS PROFESSIONNELLES SANS DÉPENDANCE VENTES
-- =====================================================
