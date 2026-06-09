"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacturesController = void 0;
const databaseService_1 = __importDefault(require("../services/databaseService"));
class FacturesController {
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
          Email_Client,  -- Ajout de l'email du client
          CASE 
            WHEN PDF_Base64 IS NOT NULL AND PDF_Base64 != '' 
            THEN true 
            ELSE false 
          END as has_pdf
        FROM ventes
        ORDER BY Date DESC
      `;
            const factures = await databaseService_1.default.query(query);
            // Vérifier les factures avec PDF_Base64 pour débogage
            console.log('=== VÉRIFICATION PDF ===');
            factures.forEach((facture) => {
                const hasPdf = facture.PDF_Base64 && facture.PDF_Base64.trim() !== '';
                console.log(`Facture ${facture.Numero}: has_pdf = ${facture.has_pdf}, PDF_Base64 = ${hasPdf ? 'présent (' + facture.PDF_Base64.length + ' chars)' : 'vide'}`);
            });
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
            const result = await databaseService_1.default.query(query, [id]);
            if (result.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Facture non trouvée'
                });
            }
            const facture = result[0];
            console.log('=== DÉTAILS FACTURE ===');
            console.log('Numéro:', facture.Numero);
            console.log('Client:', facture.Client_Nom);
            console.log('PDF_Base64 présent:', !!facture.PDF_Base64);
            console.log('Longueur PDF_Base64:', facture.PDF_Base64 ? facture.PDF_Base64.length : 0);
            if (!facture.PDF_Base64) {
                return res.json({
                    status: 'ok',
                    has_pdf: false,
                    message: `Aucun PDF disponible pour la facture ${facture.Numero}. Le champ PDF_Base64 est vide dans la base de données.`
                });
            }
            console.log('PDF_Base64 trouvé pour facture', facture.Numero);
            // Convertir la date en chaîne si c'est un objet Date
            const dateStr = facture.Date instanceof Date
                ? facture.Date.toISOString().split('T')[0]
                : (facture.Date || '').toString().split('T')[0];
            res.json({
                status: 'ok',
                has_pdf: true,
                pdf_base64: facture.PDF_Base64,
                filename: `facture-${facture.Numero}-${dateStr || new Date().toISOString().slice(0, 10)}.pdf`
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du PDF:', error);
            console.error('Détail erreur:', error.message);
            console.error('Stack erreur:', error.stack);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération du PDF: ' + error.message
            });
        }
    }
    // Récupérer les détails complets d'une facture avec produits
    static async getFactureDetails(req, res) {
        try {
            const { id } = req.params;
            // Récupérer les informations principales de la facture
            const factureQuery = `
        SELECT * FROM ventes WHERE VTCLEUNIK = ?
      `;
            const factureResult = await databaseService_1.default.query(factureQuery, [id]);
            if (factureResult.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Facture non trouvée'
                });
            }
            const facture = factureResult[0];
            // Récupérer les articles liés à cette facture depuis la table ligne_vente
            let produits = [];
            try {
                const articlesQuery = `
          SELECT
            lv.id AS ligneId,
            lv.article_id AS articleId,
            COALESCE(a.LIBELLE, 'Article inconnu') AS designation,
            lv.quantite AS quantite,
            lv.prix_unitaire AS prixUnitaire,
            lv.remise AS remise,
            ROUND(lv.quantite * lv.prix_unitaire * (1 - COALESCE(lv.remise, 0) / 100), 2) AS totalHT,
            ROUND(lv.quantite * lv.prix_unitaire * (1 - COALESCE(lv.remise, 0) / 100) * 1.2, 2) AS totalTTC,
            ROUND(lv.quantite * lv.prix_unitaire * (1 - COALESCE(lv.remise, 0) / 100) * 0.2, 2) AS totalTVA
          FROM ligne_vente lv
          LEFT JOIN articles a ON a.ARCLEUNIK = lv.article_id
          WHERE lv.vente_id = ?
          ORDER BY lv.id ASC
        `;
                produits = await databaseService_1.default.query(articlesQuery, [id]);
            }
            catch (error) {
                console.log('Erreur lors de la récupération des lignes de vente :', error);
            }
            // Si aucun produit trouvé, créer un produit à partir des données de la facture
            if (!Array.isArray(produits) || produits.length === 0) {
                const totalHT = parseFloat(facture.Total_B_HT || 0);
                const totalTTC = parseFloat(facture.Total_TTC || 0);
                const totalTVA = parseFloat(facture.Total_Tva || 0);
                produits = [
                    {
                        AR_Design: `Vente globale - Facture ${facture.Numero}`,
                        AR_Qte: 1,
                        AR_Prix_Unitaire: totalHT,
                        AR_Montant_HT: totalHT,
                        AR_Taux_TVA: totalHT > 0 ? (totalTVA / totalHT * 100) : 20,
                        AR_Montant_TVA: totalTVA,
                        AR_Montant_TTC: totalTTC
                    }
                ];
            }
            res.json({
                status: 'ok',
                data: {
                    facture,
                    produits: produits
                }
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des détails:', error);
            console.error('Détail erreur:', error.message);
            console.error('Stack erreur:', error.stack);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération du PDF: ' + error.message
            });
        }
    }
    // Sauvegarder un PDF généré en base64
    static async saveFacturePDF(req, res) {
        try {
            const { id } = req.params;
            const { pdf_base64 } = req.body;
            if (!pdf_base64) {
                return res.status(400).json({
                    status: 'error',
                    message: 'PDF base64 requis'
                });
            }
            const query = `
        UPDATE ventes 
        SET pdf_base64 = ? 
        WHERE VTCLEUNIK = ?
      `;
            await databaseService_1.default.query(query, [pdf_base64, id]);
            res.json({
                status: 'ok',
                message: 'PDF sauvegardé avec succès'
            });
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde du PDF:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la sauvegarde du PDF'
            });
        }
    }
    // Réparer tous les PDF manquants
    static async repairAllPDFs(req, res) {
        try {
            console.log('🔧 DÉBUT DE RÉPARATION DES PDF MANQUANTS...');
            // Récupérer toutes les factures sans PDF
            const facturesSansPDF = await databaseService_1.default.query(`
        SELECT VTCLEUNIK, Numero, Client_Nom, Total_B_HT, Total_Tva, Total_TTC, Date
        FROM ventes 
        WHERE PDF_Base64 IS NULL OR PDF_Base64 = '' OR PDF_Base64 = 'vide'
        LIMIT 10
      `);
            console.log(`📄 ${facturesSansPDF.length} factures sans PDF trouvées`);
            const jsPDF = require('jspdf');
            let reparations = 0;
            for (const facture of facturesSansPDF) {
                try {
                    // Générer un PDF simple
                    const doc = new jsPDF();
                    // En-tête
                    doc.setFontSize(20);
                    doc.text('MEGA-CENTRAL', 105, 20, { align: 'center' });
                    doc.setFontSize(16);
                    doc.text('FACTURE', 105, 35, { align: 'center' });
                    doc.setFontSize(12);
                    doc.text(`Numéro: ${facture.Numero}`, 20, 55);
                    doc.text(`Date: ${new Date(facture.Date).toLocaleDateString('fr-FR')}`, 20, 65);
                    doc.text(`Client: ${facture.Client_Nom || 'Client'}`, 20, 75);
                    doc.setFontSize(14);
                    doc.text('Montants:', 20, 95);
                    doc.setFontSize(12);
                    doc.text(`Total HT: ${facture.Total_B_HT || '0.00'} €`, 20, 110);
                    doc.text(`TVA: ${facture.Total_Tva || '0.00'} €`, 20, 120);
                    doc.text(`Total TTC: ${facture.Total_TTC || '0.00'} €`, 20, 130);
                    // Pied de page
                    doc.setFontSize(10);
                    doc.text('Merci pour votre confiance - MEGA-CENTRAL', 105, 280, { align: 'center' });
                    // Convertir en base64
                    const pdfBase64 = doc.output('datauristring');
                    // Sauvegarder en base
                    await databaseService_1.default.query(`
            UPDATE ventes 
            SET PDF_Base64 = ? 
            WHERE VTCLEUNIK = ?
          `, [pdfBase64, facture.VTCLEUNIK]);
                    reparations++;
                    console.log(`✅ PDF réparé pour facture ${facture.Numero}`);
                }
                catch (error) {
                    console.error(`❌ Erreur pour facture ${facture.Numero}:`, error);
                }
            }
            res.json({
                status: 'ok',
                message: `${reparations} PDFs réparés avec succès`,
                repaired: reparations,
                total: facturesSansPDF.length
            });
        }
        catch (error) {
            console.error('Erreur lors de la réparation des PDFs:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la réparation des PDFs'
            });
        }
    }
    // Générer et sauvegarder un PDF
    static async generateAndSavePDF(req, res) {
        try {
            const { id } = req.params;
            // Récupérer les détails de la facture
            const factureQuery = `
        SELECT * FROM ventes WHERE VTCLEUNIK = ?
      `;
            const factureResult = await databaseService_1.default.query(factureQuery, [id]);
            if (factureResult.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Facture non trouvée'
                });
            }
            const facture = factureResult[0];
            // Générer le PDF (utiliser jsPDF ou autre librairie)
            const jsPDF = require('jspdf');
            const doc = new jsPDF();
            // Ajouter le contenu du PDF
            doc.setFontSize(16);
            doc.text('MEGA-CENTRAL - FACTURE', 105, 15, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`Numéro: ${facture.Numero}`, 20, 40);
            doc.text(`Date: ${facture.Date}`, 20, 50);
            doc.text(`Client: ${facture.Client_Nom}`, 20, 60);
            doc.text(`Total HT: ${facture.Total_B_HT} €`, 20, 80);
            doc.text(`Total TTC: ${facture.Total_TTC} €`, 20, 90);
            // Convertir en base64
            const pdfBase64 = doc.output('datauristring');
            // Sauvegarder en base
            await databaseService_1.default.query('UPDATE ventes SET pdf_base64 = ? WHERE VTCLEUNIK = ?', [pdfBase64, id]);
            res.json({
                status: 'ok',
                message: 'PDF généré et sauvegardé avec succès',
                pdf_base64: pdfBase64
            });
        }
        catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la génération du PDF'
            });
        }
    }
}
exports.FacturesController = FacturesController;
