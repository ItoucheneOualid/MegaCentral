"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagasinController = void 0;
const databaseService_1 = require("../services/databaseService");
class MagasinController {
    static async getMagasinsFromDb(_req, res) {
        try {
            const magasins = await databaseService_1.DatabaseService.query(`
        SELECT
          id,
          Code_Magasin AS code_magasin,
          Nom_Magasin AS nom_magasin,
          Derniere_MAJ AS derniere_maj
        FROM Magasin
        ORDER BY Nom_Magasin
      `);
            res.json({ status: 'ok', data: magasins, count: magasins.length });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des magasins:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des magasins',
            });
        }
    }
    static async getMagasinsFromUsers(_req, res) {
        res.status(501).json({
            status: 'error',
            code: 'USER_STORE_LINK_NOT_IN_SCHEMA',
            message: 'Le schéma MegaCaisse ne lie pas les utilisateurs à un magasin.',
        });
    }
    static async getRapportsZByMagasin(req, res) {
        try {
            const rapports = await databaseService_1.DatabaseService.query(`
        SELECT
          z.id,
          z.Date AS dateRapport,
          z.Code_Magasin AS codeMagasin,
          COALESCE(m.Nom_Magasin, z.Code_Magasin, '') AS nomMagasin,
          z.Nbr_Tickets AS nbTickets,
          z.CA_TTC_Jour AS totalTTC,
          z.PDF_Base64 AS pdfBase64
        FROM Zreports z
        LEFT JOIN Magasin m ON m.Code_Magasin = z.Code_Magasin
        WHERE z.Code_Magasin = ?
        ORDER BY z.Date DESC, z.id DESC
        `, [req.params.code_magasin]);
            res.json({ status: 'ok', data: rapports, count: rapports.length });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des rapports Z:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des rapports Z',
            });
        }
    }
}
exports.MagasinController = MagasinController;
