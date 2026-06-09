import { Request, Response } from 'express';
import DatabaseService from '../services/databaseService';

interface StockMagasin {
  id?: number;
  magasin_id: number;
  article_id: number;
  quantite_stock: number;
  seuil_min?: number | null;
  seuil_max?: number | null;
}

const toNumber = (value: unknown, defaultValue = 0): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : defaultValue;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const stockAlertExpression = `
  CASE
    WHEN sm.seuil_min IS NOT NULL AND sm.quantite_stock <= sm.seuil_min THEN 'critique'
    WHEN sm.seuil_max IS NOT NULL AND sm.quantite_stock >= sm.seuil_max THEN 'excessif'
    WHEN sm.seuil_min IS NOT NULL AND sm.quantite_stock <= sm.seuil_min * 1.2 THEN 'bas'
    ELSE 'normal'
  END`;

const stockSelectQuery = `
  SELECT
    sm.id,
    sm.magasin_id,
    sm.article_id,
    sm.quantite_stock,
    sm.seuil_min,
    sm.seuil_max,
    m.Nom_Magasin AS magasin_nom,
    a.LIBELLE AS article_libelle,
    a.Code_Barres AS article_code_barres,
    COALESCE(a.Prix_Vente_HT, 0) AS prix_vente_ht,
    ${stockAlertExpression} AS niveau_alerte
  FROM stock_magasin sm
  LEFT JOIN magasin m ON sm.magasin_id = m.id
  LEFT JOIN articles a ON sm.article_id = a.ARCLEUNIK
`;

const stockCountQuery = `
  SELECT COUNT(*) AS total
  FROM stock_magasin sm
  LEFT JOIN magasin m ON sm.magasin_id = m.id
  LEFT JOIN articles a ON sm.article_id = a.ARCLEUNIK
`;

export class StockMagasinController {
  static async getAllStocks(req: Request, res: Response) {
    try {
      const {
        magasinId,
        articleId,
        search,
        withStockOnly,
        alert,
        page = '1',
        limit = '50',
      } = req.query;

      const filters: string[] = [];
      const params: any[] = [];

      if (magasinId) {
        filters.push('sm.magasin_id = ?');
        params.push(magasinId);
      }

      if (articleId) {
        filters.push('sm.article_id = ?');
        params.push(articleId);
      }

      if (withStockOnly === 'true') {
        filters.push('sm.quantite_stock > 0');
      }

      if (alert) {
        filters.push(`${stockAlertExpression} = ?`);
        params.push(String(alert).toLowerCase());
      }

      if (search) {
        filters.push('(a.LIBELLE LIKE ? OR a.Code_Barres LIKE ? OR m.Nom_Magasin LIKE ?)');
        const searchValue = `%${search}%`;
        params.push(searchValue, searchValue, searchValue);
      }

      const pageNumber = Math.max(1, Number(page));
      const limitNumber = Math.max(1, Number(limit));
      const offset = (pageNumber - 1) * limitNumber;

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      const totalResult = await DatabaseService.query(
        `${stockCountQuery}
         ${whereClause}`,
        params
      );
      const total = Number(totalResult[0]?.total ?? 0);

      const stocks = await DatabaseService.query(
        `${stockSelectQuery}
         ${whereClause}
         ORDER BY m.Nom_Magasin, a.LIBELLE
         LIMIT ?
         OFFSET ?`,
        [...params, limitNumber, offset]
      );

      res.json({
        success: true,
        data: stocks,
        page: pageNumber,
        limit: limitNumber,
        total,
        message: 'Stocks récupérés avec succès',
      });
    } catch (error: any) {
      console.error('Erreur getAllStocks:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des stocks',
        error: error.message,
      });
    }
  }

  static async getStockById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const stocks = await DatabaseService.query(
        `${stockSelectQuery}
         WHERE sm.id = ?
         LIMIT 1`,
        [id]
      );

      if (stocks.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Stock non trouvé',
        });
      }

      res.json({
        success: true,
        data: stocks[0],
        message: 'Stock récupéré avec succès',
      });
    } catch (error: any) {
      console.error('Erreur getStockById:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du stock',
        error: error.message,
      });
    }
  }

  static async getStocksByMagasin(req: Request, res: Response) {
    try {
      const { magasinId } = req.params;

      const stocks = await DatabaseService.query(
        `${stockSelectQuery}
         WHERE sm.magasin_id = ?
         ORDER BY a.LIBELLE`,
        [magasinId]
      );

      res.json({
        success: true,
        data: stocks,
        message: 'Stocks du magasin récupérés avec succès',
      });
    } catch (error: any) {
      console.error('Erreur getStocksByMagasin:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des stocks du magasin',
        error: error.message,
      });
    }
  }

  static async getStocksByArticle(req: Request, res: Response) {
    try {
      const { articleId } = req.params;

      const stocks = await DatabaseService.query(
        `${stockSelectQuery}
         WHERE sm.article_id = ?
         ORDER BY m.Nom_Magasin`,
        [articleId]
      );

      res.json({
        success: true,
        data: stocks,
        message: "Stocks de l'article récupérés avec succès",
      });
    } catch (error: any) {
      console.error('Erreur getStocksByArticle:', error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des stocks de l'article",
        error: error.message,
      });
    }
  }

  static async getStockAlerts(req: Request, res: Response) {
    try {
      const alerts = await DatabaseService.query(
        `${stockSelectQuery}
         WHERE sm.seuil_min IS NOT NULL
           AND sm.quantite_stock <= sm.seuil_min * 1.2
         ORDER BY sm.quantite_stock ASC`
      );

      res.json({
        success: true,
        data: alerts,
        message: 'Alertes de stock récupérées avec succès',
      });
    } catch (error: any) {
      console.error('Erreur getStockAlerts:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des alertes de stock',
        error: error.message,
      });
    }
  }

  static async createStock(req: Request, res: Response) {
    try {
      const stock: StockMagasin = req.body;

      if (!stock.magasin_id || !stock.article_id || stock.quantite_stock === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Les champs magasin_id, article_id et quantite_stock sont requis',
        });
      }

      const articleResult = await DatabaseService.query(
        'SELECT ARCLEUNIK FROM articles WHERE ARCLEUNIK = ?',
        [stock.article_id]
      );

      if (articleResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Article introuvable',
        });
      }

      const magasinResult = await DatabaseService.query(
        'SELECT id FROM magasin WHERE id = ?',
        [stock.magasin_id]
      );

      if (magasinResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Magasin introuvable',
        });
      }

      const existingStock = await DatabaseService.query(
        'SELECT id FROM stock_magasin WHERE magasin_id = ? AND article_id = ?',
        [stock.magasin_id, stock.article_id]
      );

      if (existingStock.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Un stock existe déjà pour cet article dans ce magasin',
        });
      }

      await DatabaseService.query(
        `INSERT INTO stock_magasin
         (magasin_id, article_id, quantite_stock, seuil_min, seuil_max)
         VALUES (?, ?, ?, ?, ?)`,
        [
          toNumber(stock.magasin_id),
          toNumber(stock.article_id),
          toNumber(stock.quantite_stock),
          toNullableNumber(stock.seuil_min),
          toNullableNumber(stock.seuil_max),
        ]
      );

      const newStock = await DatabaseService.query(
        `${stockSelectQuery}
         WHERE sm.magasin_id = ? AND sm.article_id = ?
         LIMIT 1`,
        [stock.magasin_id, stock.article_id]
      );

      res.status(201).json({
        success: true,
        data: newStock[0] || null,
        message: 'Stock créé avec succès',
      });
    } catch (error: any) {
      console.error('Erreur createStock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du stock',
        error: error.message,
      });
    }
  }

  static async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantite_stock, seuil_min, seuil_max } = req.body;

      const existingStock = await DatabaseService.query(
        'SELECT id FROM stock_magasin WHERE id = ?',
        [id]
      );

      if (existingStock.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Stock non trouvé',
        });
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (quantite_stock !== undefined) {
        updateFields.push('quantite_stock = ?');
        updateValues.push(toNumber(quantite_stock));
      }

      if (seuil_min !== undefined) {
        updateFields.push('seuil_min = ?');
        updateValues.push(toNullableNumber(seuil_min));
      }

      if (seuil_max !== undefined) {
        updateFields.push('seuil_max = ?');
        updateValues.push(toNullableNumber(seuil_max));
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucun champ à mettre à jour',
        });
      }

      updateValues.push(id);

      await DatabaseService.query(
        `UPDATE stock_magasin SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      const updatedStock = await DatabaseService.query(
        `${stockSelectQuery}
         WHERE sm.id = ?
         LIMIT 1`,
        [id]
      );

      res.json({
        success: true,
        data: updatedStock[0],
        message: 'Stock mis à jour avec succès',
      });
    } catch (error: any) {
      console.error('Erreur updateStock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du stock',
        error: error.message,
      });
    }
  }

  static async deleteStock(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingStock = await DatabaseService.query(
        'SELECT id FROM stock_magasin WHERE id = ?',
        [id]
      );

      if (existingStock.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Stock non trouvé',
        });
      }

      await DatabaseService.query('DELETE FROM stock_magasin WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Stock supprimé avec succès',
      });
    } catch (error: any) {
      console.error('Erreur deleteStock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du stock',
        error: error.message,
      });
    }
  }
}
