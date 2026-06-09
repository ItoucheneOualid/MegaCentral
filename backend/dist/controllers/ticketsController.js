"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const databaseService_1 = __importDefault(require("../services/databaseService"));
class TicketsController {
    // Récupérer tous les tickets
    static async getAllTickets(req, res) {
        try {
            const query = `
        SELECT 
          Numero,
          Date,
          Client_No,
          Client_Nom,
          Total_HT,
          Total_TVA,
          Total_TTC,
          Etat,
          Code_magasin,
          CASE 
            WHEN pdf_base64 IS NOT NULL AND pdf_base64 != '' 
            THEN true 
            ELSE false 
          END as has_pdf
        FROM tickets
        ORDER BY Date DESC
      `;
            const tickets = await databaseService_1.default.query(query);
            res.json({
                status: 'ok',
                data: tickets,
                count: tickets.length
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des tickets:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération des tickets'
            });
        }
    }
    // Récupérer le PDF d'un ticket spécifique
    static async getTicketPDF(req, res) {
        try {
            const { id } = req.params;
            const query = `
        SELECT 
          pdf_base64, Numero, Date, Heure, Client_Nom
        FROM tickets
        WHERE CLEUNIK = ?
      `;
            const result = await databaseService_1.default.query(query, [id]);
            if (result.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Ticket non trouvé'
                });
            }
            const ticket = result[0];
            if (!ticket.pdf_base64) {
                return res.json({
                    status: 'ok',
                    has_pdf: false,
                    message: 'Aucun PDF disponible pour ce ticket'
                });
            }
            res.json({
                status: 'ok',
                has_pdf: true,
                pdf_base64: ticket.pdf_base64.startsWith('data:application/pdf;base64,')
                    ? ticket.pdf_base64
                    : `data:application/pdf;base64,${ticket.pdf_base64}`,
                filename: `ticket-${ticket.Numero}-${ticket.Date}.pdf`
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du PDF:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la récupération du PDF'
            });
        }
    }
    // Sauvegarder un PDF généré en base64
    static async saveTicketPDF(req, res) {
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
        UPDATE tickets 
        SET pdf_base64 = ? 
        WHERE CLEUNIK = ?
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
    // Générer et sauvegarder un PDF
    static async generateAndSaveTicketPDF(req, res) {
        try {
            const { id } = req.params;
            // Récupérer les détails du ticket
            const ticketQuery = `
        SELECT * FROM tickets WHERE CLEUNIK = ?
      `;
            const ticketResult = await databaseService_1.default.query(ticketQuery, [id]);
            if (ticketResult.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Ticket non trouvé'
                });
            }
            const ticket = ticketResult[0];
            // Générer le PDF
            const jsPDF = require('jspdf');
            const doc = new jsPDF();
            // Ajouter le contenu du PDF
            doc.setFontSize(16);
            doc.text('MEGA-CENTRAL - TICKET', 105, 15, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`Numéro: ${ticket.Numero}`, 20, 40);
            doc.text(`Date: ${ticket.Date}`, 20, 50);
            doc.text(`Heure: ${ticket.Heure}`, 20, 60);
            doc.text(`Client: ${ticket.Client_Nom}`, 20, 70);
            doc.text(`Total HT: ${ticket.Total_HT} €`, 20, 80);
            doc.text(`Total TTC: ${ticket.Total_TTC} €`, 20, 90);
            doc.text(`État: ${ticket.Etat || 'Normal'}`, 20, 100);
            doc.text(`Magasin: ${ticket.Code_magasin || '-'}`, 20, 110);
            // Convertir en base64
            const pdfBase64 = doc.output('datauristring').replace('data:application/pdf;base64,', '');
            // Sauvegarder en base
            await databaseService_1.default.query('UPDATE tickets SET pdf_base64 = ? WHERE CLEUNIK = ?', [pdfBase64, id]);
            res.json({
                status: 'ok',
                message: 'PDF généré et sauvegardé avec succès',
                pdf_base64: `data:application/pdf;base64,${pdfBase64}`
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
exports.TicketsController = TicketsController;
