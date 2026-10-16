import { Request, Response } from 'express';
import { DatabaseService } from '../services/databaseService';

export class TvaController {
  // Récupérer tous les taux de TVA
  static async getAllTva(req: Request, res: Response) {
    try {
      const query = `
        SELECT TVA_ID, Taux, Description, Derniere_MAJ
        FROM tva
        ORDER BY Taux ASC
      `;

      const result = await DatabaseService.query(query);
      const tvaData = Array.isArray(result) ? result : [];

      res.json({
        status: 'ok',
        data: tvaData,
        count: tvaData.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des TVA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des TVA'
      });
    }
  }

  // Récupérer une TVA par son ID
  static async getTvaById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const query = `
        SELECT TVA_ID, Taux, Description, Derniere_MAJ
        FROM tva
        WHERE TVA_ID = ?
      `;

      const result = await DatabaseService.query(query, [id]);
      const tvaData = Array.isArray(result) ? result : [];

      if (tvaData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'TVA non trouvée'
        });
      }

      res.json({
        success: true,
        data: tvaData[0]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la TVA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de la TVA'
      });
    }
  }

  // Récupérer tous les taux de TVA (la table `tva` MegaCaisse ne porte pas de champ "actif")
  static async getActiveTva(req: Request, res: Response) {
    try {
      const query = `
        SELECT TVA_ID, Taux, Description, Derniere_MAJ
        FROM tva
        ORDER BY Taux ASC
      `;

      const result = await DatabaseService.query(query);
      const tvaData = Array.isArray(result) ? result : [];

      res.json({
        success: true,
        data: tvaData,
        count: tvaData.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des TVA actives:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des TVA actives'
      });
    }
  }

  // Exporter les TVA en CSV
  static async exportTvaCSV(req: Request, res: Response) {
    try {
      const { search } = req.query;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      if (search) {
        whereClause += ' AND (Description LIKE ? OR Taux LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      const query = `
        SELECT
          TVA_ID as 'ID',
          Description as 'Description',
          Taux as 'Taux (%)',
          DATE_FORMAT(Derniere_MAJ, '%d/%m/%Y') as 'Dernière MAJ'
        FROM tva
        ${whereClause}
        ORDER BY Taux ASC
      `;

      const result = await DatabaseService.query(query, params);
      const tvaData = Array.isArray(result) ? result : [];

      if (tvaData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aucune TVA trouvée'
        });
      }

      const csvHeader = Object.keys(tvaData[0] || {}).join(';');
      const csvRows = tvaData.map((t: any) => Object.values(t).join(';'));
      const csvContent = [csvHeader, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="tva_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // UTF-8 BOM pour Excel
    } catch (error) {
      console.error('Erreur lors de l\'export CSV des TVA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'export CSV'
      });
    }
  }

  // Calculer le montant TTC depuis HT
  static async calculerTTC(req: Request, res: Response) {
    try {
      const { montantHT, idTva } = req.body;

      if (!montantHT || !idTva) {
        return res.status(400).json({
          success: false,
          error: 'Montant HT et ID TVA sont requis'
        });
      }

      const tvaQuery = `
        SELECT Taux FROM tva WHERE TVA_ID = ?
      `;

      const result = await DatabaseService.query(tvaQuery, [idTva]);
      const tvaData = Array.isArray(result) ? result : [];

      if (tvaData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'TVA non trouvée'
        });
      }

      const taux = tvaData[0].Taux;
      const montantTVA = montantHT * (taux / 100);
      const montantTTC = montantHT + montantTVA;

      res.json({
        success: true,
        data: {
          montantHT: parseFloat(montantHT),
          taux: taux,
          montantTVA: parseFloat(montantTVA.toFixed(2)),
          montantTTC: parseFloat(montantTTC.toFixed(2))
        }
      });
    } catch (error) {
      console.error('Erreur lors du calcul TTC:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du calcul TTC'
      });
    }
  }
}
