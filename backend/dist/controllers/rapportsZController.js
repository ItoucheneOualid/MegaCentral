"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportsZController = void 0;
const databaseService_1 = require("../services/databaseService");
const RAPPORTS_SELECT = `
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
`;
const escapeCsv = (value) => {
    const text = value == null ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
};
class RapportsZController {
    static async getAllRapportsZ(_req, res) {
        try {
            const rapports = await databaseService_1.DatabaseService.query(`${RAPPORTS_SELECT} ORDER BY z.Date DESC, z.id DESC`);
            const totals = rapports.reduce((sum, rapport) => ({
                totalTickets: sum.totalTickets + Number(rapport.nbTickets || 0),
                totalTTC: sum.totalTTC + Number(rapport.totalTTC || 0),
            }), { totalTickets: 0, totalTTC: 0 });
            res.json({ status: 'ok', data: rapports, count: rapports.length, totals });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des rapports Z:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des rapports Z',
            });
        }
    }
    static async getRapportsZByMagasin(req, res) {
        try {
            const rapports = await databaseService_1.DatabaseService.query(`${RAPPORTS_SELECT}
         WHERE z.Code_Magasin = ?
         ORDER BY z.Date DESC, z.id DESC`, [req.params.codeMagasin]);
            res.json({ status: 'ok', data: rapports, count: rapports.length });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des rapports Z du magasin:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des rapports Z du magasin',
            });
        }
    }
    static async getRapportsZByPeriode(req, res) {
        const { dateDebut, dateFin } = req.query;
        if (typeof dateDebut !== 'string' ||
            typeof dateFin !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(dateDebut) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(dateFin)) {
            res.status(400).json({
                status: 'error',
                message: 'Les dates de début et de fin doivent être au format AAAA-MM-JJ.',
            });
            return;
        }
        try {
            const rapports = await databaseService_1.DatabaseService.query(`${RAPPORTS_SELECT}
         WHERE z.Date BETWEEN ? AND ?
         ORDER BY z.Date DESC, z.id DESC`, [dateDebut, dateFin]);
            res.json({ status: 'ok', data: rapports, count: rapports.length });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des rapports Z par période:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des rapports Z par période',
            });
        }
    }
    static async exportRapportsZCSV(_req, res) {
        try {
            const rapports = await databaseService_1.DatabaseService.query(`${RAPPORTS_SELECT} ORDER BY z.Date DESC, z.id DESC`);
            const rows = [
                ['Date', 'Magasin', 'Code Magasin', 'Tickets', 'CA TTC'].map(escapeCsv).join(','),
                ...rapports.map((rapport) => [
                    rapport.dateRapport,
                    rapport.nomMagasin,
                    rapport.codeMagasin,
                    rapport.nbTickets,
                    rapport.totalTTC,
                ].map(escapeCsv).join(',')),
            ];
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=rapports_z.csv');
            res.send(rows.join('\r\n'));
        }
        catch (error) {
            console.error('Erreur lors de l’export CSV des rapports Z:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de l’export CSV des rapports Z',
            });
        }
    }
}
exports.RapportsZController = RapportsZController;
