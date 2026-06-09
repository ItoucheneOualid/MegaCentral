-- Vue simple pour les mouvements de stock basés sur les ventes existantes
CREATE VIEW vue_mouvements_stock AS
SELECT 
  v.VCLEUNIK as vente_id,
  lv.ARCLEUNIK as article_id,
  lv.quantite as quantite_vendue,
  v.DateVente as date_mouvement,
  'VENTE' as type_mouvement,
  m.id as magasin_id,
  m.Nom_Magasin as nom_magasin,
  a.LIBELLE as libelle_article,
  a.Code_Barres as code_barres,
  a.Prix_TTC1 as prix_unitaire,
  (lv.quantite * a.Prix_TTC1) as montant_total,
  v.Client as reference_client
FROM ventes v
LEFT JOIN ligne_vente lv ON v.VCLEUNIK = lv.VCLEUNIK
LEFT JOIN articles a ON lv.ARCLEUNIK = a.ARCLEUNIK
LEFT JOIN magasin m ON v.Magasin = m.id
WHERE v.DateVente IS NOT NULL
ORDER BY v.DateVente DESC;

-- Vue pour l'état actuel des stocks avec alertes
CREATE VIEW vue_etat_stocks AS
SELECT 
  sm.id,
  sm.magasin_id,
  m.Nom_Magasin as nom_magasin,
  sm.article_id,
  a.LIBELLE as libelle_article,
  a.Code_Barres as code_barres,
  a.Prix_TTC1 as prix_vente_ttc,
  sm.quantite_stock as quantite_actuelle,
  sm.seuil_min,
  sm.seuil_max,
  CASE 
    WHEN sm.seuil_min IS NOT NULL AND sm.quantite_stock <= sm.seuil_min THEN 'CRITIQUE'
    WHEN sm.seuil_min IS NOT NULL AND sm.quantite_stock <= (sm.seuil_min * 1.2) THEN 'FAIBLE'
    WHEN sm.seuil_max IS NOT NULL AND sm.quantite_stock >= sm.seuil_max THEN 'EXCESSIF'
    ELSE 'NORMAL'
  END as niveau_alerte,
  -- Calcul simple des ventes des 30 derniers jours
  (SELECT COALESCE(SUM(lv.quantite), 0) 
   FROM ligne_vente lv 
   JOIN ventes v ON lv.VCLEUNIK = v.VCLEUNIK 
   WHERE lv.ARCLEUNIK = sm.article_id 
   AND v.Magasin = sm.magasin_id 
   AND v.DateVente >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  ) as ventes_30_jours
FROM stock_magasin sm
LEFT JOIN magasin m ON sm.magasin_id = m.id
LEFT JOIN articles a ON sm.article_id = a.ARCLEUNIK;
