import { Request, Response } from 'express';
import { DatabaseService } from '../services/databaseService';

export class MagasinController {
  static async getMagasinsFromDb(_req: Request, res: Response) {
    try {
      const magasins = await DatabaseService.query(`
        SELECT
          id,
          Code_Magasin AS code_magasin,
          Nom_Magasin AS nom_magasin,
          Derniere_MAJ AS derniere_maj
        FROM magasin
        ORDER BY Nom_Magasin
      `);

      res.json({ status: 'ok', data: magasins, count: magasins.length });
    } catch (error) {
      console.error('Erreur lors de la récupération des magasins:', error);
      res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des magasins',
      });
    }
  }

  static async getMagasinsFromUsers(_req: Request, res: Response) {
    res.status(501).json({
      status: 'error',
      code: 'USER_STORE_LINK_NOT_IN_SCHEMA',
      message: 'Le schéma MegaCaisse ne lie pas les utilisateurs à un magasin.',
    });
  }

  static async getRapportsZByMagasin(req: Request, res: Response) {
    try {
      const rapports = await DatabaseService.query(
        `
        SELECT
          z.id,
          z.Date AS dateRapport,
          z.Code_Magasin AS codeMagasin,
          COALESCE(m.Nom_Magasin, z.Code_Magasin, '') AS nomMagasin,
          z.Nbr_Tickets AS nbTickets,
          z.CA_TTC_Jour AS totalTTC,
          z.PDF_Base64 AS pdfBase64
        FROM zreports z
        LEFT JOIN magasin m ON m.Code_Magasin = z.Code_Magasin
        WHERE z.Code_Magasin = ?
        ORDER BY z.Date DESC, z.id DESC
        `,
        [req.params.code_magasin]
      );

      res.json({ status: 'ok', data: rapports, count: rapports.length });
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports Z:', error);
      res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des rapports Z',
      });
    }
  }
}
