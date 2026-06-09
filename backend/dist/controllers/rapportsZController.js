"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportsZController = void 0;
const databaseService_1 = require("../services/databaseService");
class RapportsZController {
    // Récupérer tous les rapports Z
    static async getAllRapportsZ(req, res) {
        try {
            console.log('🔍 Récupération des vrais rapports Z depuis la base de données...');
            // Récupérer les vraies données depuis la base MySQL
            const query = `
        SELECT 
          id,
          date_rapport as dateRapport,
          code_magasin as codeMagasin,
          nom_magasin as nomMagasin,
          periode_debut as periodeDebut,
          periode_fin as periodeFin,
          nb_tickets as nbTickets,
          total_ht as totalHT,
          total_tva as totalTVA,
          total_ttc as totalTTC,
          total_remise as totalRemise,
          est_annule as estAnnule,
          cree_le as creeLe
        FROM rapports_z 
        ORDER BY date_rapport DESC
      `;
            const rapportsData = await databaseService_1.DatabaseService.query(query);
            console.log(`✅ ${rapportsData.length} rapports Z récupérés depuis la base de données`);
            // Afficher les totaux réels pour vérification
            const totalTickets = rapportsData.reduce((sum, rapport) => sum + (rapport.nbTickets || 0), 0);
            const totalTTC = rapportsData.reduce((sum, rapport) => sum + (rapport.totalTTC || 0), 0);
            console.log(`📊 Totaux réels - Tickets: ${totalTickets}, TTC: ${totalTTC.toFixed(2)}€`);
            res.json({
                status: 'ok',
                data: rapportsData,
                count: rapportsData.length,
                totals: {
                    totalTickets,
                    totalTTC
                }
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération des rapports Z:', error);
            // Si la table n'existe pas, afficher un message clair
            if (error instanceof Error && error.message.includes("Table") && error.message.includes("doesn't exist")) {
                res.status(404).json({
                    status: 'error',
                    message: 'La table rapports_z n\'existe pas dans la base de données. Veuillez créer la table d\'abord.',
                    details: 'Table requise: rapports_z dans la base idmegacentral'
                });
            }
            else {
                res.status(500).json({
                    status: 'error',
                    message: 'Erreur lors de la récupération des rapports Z',
                    details: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        }
    }
    // Récupérer les rapports Z par magasin
    static async getRapportsZByMagasin(req, res) {
        try {
            const { codeMagasin } = req.params;
            console.log(`🔍 Récupération des rapports Z pour le magasin ${codeMagasin}...`);
            // Récupérer les vraies données depuis la base MySQL
            const query = `
        SELECT 
          id,
          date_rapport as dateRapport,
          code_magasin as codeMagasin,
          nom_magasin as nomMagasin,
          periode_debut as periodeDebut,
          periode_fin as periodeFin,
          nb_tickets as nbTickets,
          total_ht as totalHT,
          total_tva as totalTVA,
          total_ttc as totalTTC,
          total_remise as totalRemise,
          est_annule as estAnnule,
          cree_le as creeLe
        FROM rapports_z 
        WHERE code_magasin = ?
        ORDER BY date_rapport DESC
      `;
            const rapportsData = await databaseService_1.DatabaseService.query(query, [codeMagasin]);
            console.log(`✅ ${rapportsData.length} rapports Z récupérés pour le magasin ${codeMagasin}`);
            res.json({
                status: 'ok',
                data: rapportsData,
                count: rapportsData.length
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération des rapports Z du magasin:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des rapports Z du magasin',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    // Récupérer les rapports Z par période
    static async getRapportsZByPeriode(req, res) {
        try {
            const { dateDebut, dateFin } = req.query;
            console.log(`🔍 Récupération des rapports Z pour la période ${dateDebut} au ${dateFin}...`);
            // Récupérer les vraies données depuis la base MySQL
            const query = `
        SELECT 
          id,
          date_rapport as dateRapport,
          code_magasin as codeMagasin,
          nom_magasin as nomMagasin,
          periode_debut as periodeDebut,
          periode_fin as periodeFin,
          nb_tickets as nbTickets,
          total_ht as totalHT,
          total_tva as totalTVA,
          total_ttc as totalTTC,
          total_remise as totalRemise,
          est_annule as estAnnule,
          cree_le as creeLe
        FROM rapports_z 
        WHERE date_rapport BETWEEN ? AND ?
        ORDER BY date_rapport DESC
      `;
            const rapportsData = await databaseService_1.DatabaseService.query(query, [dateDebut, dateFin]);
            console.log(`✅ ${rapportsData.length} rapports Z récupérés pour la période ${dateDebut} au ${dateFin}`);
            res.json({
                status: 'ok',
                data: rapportsData,
                count: rapportsData.length
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération des rapports Z par période:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des rapports Z par période',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    // Exporter les rapports Z en CSV
    static async exportRapportsZCSV(req, res) {
        try {
            console.log('📤 Export CSV des rapports Z depuis la base de données...');
            // Récupérer les vraies données depuis la base MySQL
            const query = `
        SELECT 
          date_rapport,
          nom_magasin,
          code_magasin,
          nb_tickets,
          total_ht,
          total_tva,
          total_ttc
        FROM rapports_z 
        ORDER BY date_rapport DESC
      `;
            const rapportsData = await databaseService_1.DatabaseService.query(query);
            console.log(`✅ ${rapportsData.length} rapports Z préparés pour l'export CSV`);
            // Générer le contenu CSV
            let csvContent = 'Date,Magasin,Code Magasin,Tickets,CA HT,TVA,CA TTC\n';
            rapportsData.forEach((rapport) => {
                csvContent += `${rapport.date_rapport},${rapport.nom_magasin},${rapport.code_magasin},${rapport.nb_tickets},${rapport.total_ht},${rapport.total_tva},${rapport.total_ttc}\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=rapports_z.csv');
            res.send(csvContent);
        }
        catch (error) {
            console.error('❌ Erreur lors de l\'export CSV des rapports Z:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de l\'export CSV des rapports Z',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
}
exports.RapportsZController = RapportsZController;
