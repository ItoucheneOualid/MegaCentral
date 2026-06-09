import { Request, Response } from 'express';
import DatabaseService from '../services/databaseService';

export class MouvementsStockController {
  // POST /api/mouvements-stock/sortie - Sortir du stock
  static async sortieStock(req: Request, res: Response) {
    try {
      const { stock_id, quantite, raison, reference_document } = req.body;
      const utilisateur_id = 11; // ID par défaut pour le TFE

      // Validation simple
      if (!stock_id || !quantite || quantite <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides'
        });
      }

      // Récupérer le stock et vérifier le flag manage_stock de l'article
      const stockResult = await DatabaseService.query(
        `SELECT sm.*, a.manage_stock
         FROM stock_magasin sm
         LEFT JOIN articles a ON sm.article_id = a.ARCLEUNIK
         WHERE sm.id = ?`,
        [stock_id]
      );

      if (!stockResult || stockResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Stock non trouvé'
        });
      }

      const stock = stockResult[0];

      if (stock.manage_stock !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Cet article n\'est pas géré en stock'
        });
      }

      const quantiteActuelle = parseFloat(stock.quantite_stock);

      // Vérifier la quantité
      if (quantite > quantiteActuelle) {
        return res.status(400).json({
          success: false,
          message: 'Quantité insuffisante'
        });
      }

      // Mettre à jour le stock
      const nouvelleQuantite = quantiteActuelle - quantite;
      await DatabaseService.query(
        'UPDATE stock_magasin SET quantite_stock = ? WHERE id = ?',
        [nouvelleQuantite, stock_id]
      );

      // Enregistrer le mouvement (sans les JOINs complexes)
      await DatabaseService.query(
        `INSERT INTO mouvements_stock 
         (stock_id, type_mouvement, quantite, quantite_avant, quantite_apres, raison, reference_document, utilisateur_id, magasin_id, article_id) 
         VALUES (?, 'SORTIE', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [stock_id, quantite, quantiteActuelle, nouvelleQuantite, raison || 'Sortie TFE', reference_document, utilisateur_id, stock.magasin_id, stock.article_id]
      );

      res.json({
        success: true,
        message: 'Sortie de stock réussie',
        data: {
          quantite_avant: quantiteActuelle,
          quantite_apres: nouvelleQuantite
        }
      });

    } catch (error: any) {
      console.error('Erreur sortie stock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur technique'
      });
    }
  }

  // GET /api/mouvements-stock/historique - Historique des mouvements
  static async getHistorique(req: Request, res: Response) {
    try {
      const { stock_id, page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (stock_id) {
        whereClause += ' AND ms.stock_id = ?';
        params.push(stock_id);
      }

      // Récupérer l'historique avec pagination
      const [mouvements] = await DatabaseService.query(`
        SELECT 
          ms.*,
          a.LIBELLE as article_nom,
          m.Nom_Magasin as magasin_nom,
          u.nom as utilisateur_nom
        FROM mouvements_stock ms
        LEFT JOIN articles a ON ms.article_id = a.ARCLEUNIK
        LEFT JOIN magasin m ON ms.magasin_id = m.id
        LEFT JOIN users u ON ms.utilisateur_id = u.id
        ${whereClause}
        ORDER BY ms.date_mouvement DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit as string), offset]);

      // Compter le total pour la pagination
      const [countResult] = await DatabaseService.query(`
        SELECT COUNT(*) as total FROM mouvements_stock ms ${whereClause}
      `, params);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.json({
        success: true,
        data: mouvements,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      });

    } catch (error: any) {
      console.error('Erreur getHistorique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  }

  // GET /api/mouvements-stock/statistiques - Statistiques des mouvements
  static async getStatistiques(req: Request, res: Response) {
    try {
      const { date_debut, date_fin, magasin_id } = req.query;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (date_debut) {
        whereClause += ' AND DATE(ms.date_mouvement) >= ?';
        params.push(date_debut);
      }

      if (date_fin) {
        whereClause += ' AND DATE(ms.date_mouvement) <= ?';
        params.push(date_fin);
      }

      if (magasin_id) {
        whereClause += ' AND ms.magasin_id = ?';
        params.push(magasin_id);
      }

      // Statistiques globales
      const [stats] = await DatabaseService.query(`
        SELECT 
          COUNT(*) as total_mouvements,
          SUM(CASE WHEN ms.type_mouvement = 'SORTIE' THEN ms.quantite ELSE 0 END) as total_sorties,
          SUM(CASE WHEN ms.type_mouvement LIKE 'AJUSTEMENT%' THEN ms.quantite ELSE 0 END) as total_ajustements,
          COUNT(CASE WHEN ms.type_mouvement = 'SORTIE' THEN 1 END) as nb_sorties,
          COUNT(CASE WHEN ms.type_mouvement LIKE 'AJUSTEMENT%' THEN 1 END) as nb_ajustements,
          m.Nom_Magasin as magasin_nom
        FROM mouvements_stock ms
        LEFT JOIN magasin m ON ms.magasin_id = m.id
        ${whereClause}
        GROUP BY ms.magasin_id, m.Nom_Magasin
        ORDER BY total_sorties DESC
      `, params);

      // Mouvements récents
      const [recents] = await DatabaseService.query(`
        SELECT 
          ms.*,
          a.LIBELLE as article_nom,
          m.Nom_Magasin as magasin_nom,
          u.nom as utilisateur_nom
        FROM mouvements_stock ms
        LEFT JOIN articles a ON ms.article_id = a.ARCLEUNIK
        LEFT JOIN magasin m ON ms.magasin_id = m.id
        LEFT JOIN users u ON ms.utilisateur_id = u.id
        ${whereClause}
        ORDER BY ms.date_mouvement DESC
        LIMIT 10
      `, params);

      res.json({
        success: true,
        data: {
          statistiques: stats,
          mouvements_recents: recents
        }
      });

    } catch (error: any) {
      console.error('Erreur getStatistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
}
