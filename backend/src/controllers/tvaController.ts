import { Request, Response } from 'express';
import { DatabaseService } from '../services/databaseService';

export class TvaController {
  // Récupérer tous les taux de TVA
  static async getAllTva(req: Request, res: Response) {
    try {
      const query = `
        SELECT * FROM TVA
      `;
      
      console.log('🔍 Requête SQL TVA:', query);
      
      const result = await DatabaseService.query(query);
      
      // S'assurer que c'est bien un tableau
      const tvaData = Array.isArray(result) ? result : [];
      
      console.log(`✅ TVA trouvées: ${tvaData.length}`);
      
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
        SELECT 
          id as id,
          libelle,
          taux,
          actif,
          created_at as createdAt,
          updated_at as updatedAt
        FROM TVA 
        WHERE id = ?
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

  // Récupérer uniquement les TVA actives
  static async getActiveTva(req: Request, res: Response) {
    try {
      const query = `
        SELECT 
          id as id,
          libelle,
          taux,
          created_at as createdAt,
          updated_at as updatedAt
        FROM TVA 
        WHERE actif = TRUE
        ORDER BY taux ASC
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
      const { search, actif } = req.query;
      
      let whereClause = 'WHERE 1=1';
      if (search) {
        whereClause += ` AND (libelle LIKE '%${search}%' OR taux LIKE '%${search}%')`;
      }
      if (actif !== undefined) {
        whereClause += ` AND actif = ${actif === 'true' ? 1 : 0}`;
      }
      
      const query = `
        SELECT 
          id as 'ID',
          libelle as 'Libellé',
          taux as 'Taux (%)',
          CASE WHEN actif = 1 THEN 'Oui' ELSE 'Non' END as 'Actif',
          DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as 'Date Création',
          DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i') as 'Date Mise à Jour'
        FROM TVA 
        ${whereClause}
        ORDER BY taux ASC
      `;
      
      const result = await DatabaseService.query(query);
      const tvaData = Array.isArray(result) ? result : [];
      
      if (tvaData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aucune TVA trouvée'
        });
      }
      
      // Créer le contenu CSV
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
      
      // Récupérer le taux de TVA
      const tvaQuery = `
        SELECT taux FROM TVA WHERE id = ? AND actif = TRUE
      `;
      
      const result = await DatabaseService.query(tvaQuery, [idTva]);
      const tvaData = Array.isArray(result) ? result : [];
      
      if (tvaData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'TVA non trouvée ou inactive'
        });
      }
      
      const taux = tvaData[0].taux;
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
