"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacturesControllerClean = void 0;
const databaseClean_1 = require("../config/databaseClean");
class FacturesControllerClean {
    // Récupérer toutes les factures
    static async getAllFactures(req, res) {
        try {
            const query = `
        SELECT 
          VTCLEUNIK,
          Numero,
          Date,
          Type,
          Client_No,
          Client_Nom,
          Total_B_HT,
          Total_Tva,
          Total_TTC,
          Etat,
          Code_magasin,
          Peppol_Statut,
          CASE 
            WHEN PDF_Base64 IS NOT NULL AND PDF_Base64 != '' 
            THEN true 
            ELSE false 
          END as has_pdf
        FROM ventes
        ORDER BY Date DESC
      `;
            const factures = await databaseClean_1.DatabaseService.query(query);
            res.json({
                status: 'ok',
                data: factures,
                count: factures.length
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des factures:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des factures'
            });
        }
    }
    // Récupérer le PDF d'une facture spécifique
    static async getFacturePDF(req, res) {
        try {
            const { id } = req.params;
            const query = `
        SELECT PDF_Base64, Numero, Date, Client_Nom
        FROM ventes
        WHERE VTCLEUNIK = ?
      `;
            const result = await databaseClean_1.DatabaseService.query(query, [id]);
            if (result.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Facture non trouvée'
                });
            }
            const facture = result[0];
            if (!facture.PDF_Base64) {
                return res.json({
                    status: 'ok',
                    has_pdf: false,
                    message: 'Aucun PDF disponible pour cette facture'
                });
            }
            console.log('PDF_Base64 trouvé pour facture', facture.Numero);
            // Convertir la date en chaîne
            const dateStr = facture.Date instanceof Date
                ? facture.Date.toISOString().split('T')[0]
                : (facture.Date || '').toString().split('T')[0];
            res.json({
                status: 'ok',
                has_pdf: true,
                pdf_base64: facture.PDF_Base64,
                filename: `facture-${facture.Numero}-${dateStr}.pdf`
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du PDF:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération du PDF: ' + error.message
            });
        }
    }
}
exports.FacturesControllerClean = FacturesControllerClean;
