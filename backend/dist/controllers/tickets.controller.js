"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndSaveTicketPDF = exports.saveTicketPDF = exports.getTicketPDF = exports.getTicketById = exports.getTickets = void 0;
const db_1 = require("../config/db");
const getTickets = async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        // Récupérer les paramètres de filtrage
        const { startDate, endDate, storeCode } = req.query;
        // Construire la clause WHERE dynamiquement
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (startDate && endDate) {
            whereClause += ' AND Date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        if (storeCode && storeCode !== 'all') {
            whereClause += ' AND Code_Magasin = ?';
            params.push(storeCode);
        }
        const query = `
      SELECT 
        Numero,
        Date,
        Time,
        Total_TTC,
        Total_HT,
        Total_Tva,
        Caisse,
        CACLEUNIK,
        Client_No,
        Client_Nom,
        Nature,
        Etat,
        Code_Magasin,
        CASE 
          WHEN PDF_Base64 IS NOT NULL AND PDF_Base64 != '' 
          THEN true 
          ELSE false 
        END as has_pdf
      FROM tickets
      ${whereClause}
      ORDER BY Date DESC, Time DESC
    `;
        const [rows] = await pool.execute(query, params);
        res.status(200).json({
            status: 'ok',
            data: rows,
            count: rows.length
        });
    }
    catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tickets'
        });
    }
};
exports.getTickets = getTickets;
const getTicketById = async (req, res) => {
    try {
        const ticketNumero = req.params.id;
        if (!ticketNumero || ticketNumero.trim() === '') {
            res.status(400).json({
                status: 'error',
                message: 'Ticket number is required'
            });
            return;
        }
        // Validation du format: magasin-date-sequentiel (ex: 1-2601030001)
        const ticketPattern = /^\d{1,2}-\d{6}\d{4,}$/;
        if (!ticketPattern.test(ticketNumero)) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid ticket format. Expected format: magasin-AAJJJJ-sequence (ex: 1-2601030001)'
            });
            return;
        }
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        Numero,
        Date,
        Time,
        Total_TTC,
        Total_HT,
        Total_Tva,
        Caisse,
        CACLEUNIK,
        Client_No,
        Client_Nom,
        Nature,
        Etat,
        Code_Magasin,
        Type,
        Total_Brut,
        Remise_PC,
        Remise_EnPC,
        Paiements,
        Solde,
        Benefice,
        SECLEUNIK,
        Echeance,
        Action_Type,
        Remarques,
        Points_total,
        Montant_CC,
        CC_used,
        Ticket_Facturée,
        Montant_Acompte,
        Code_Carte,
        Time_end,
        Paiement1,
        Paiement2,
        Paiement3,
        Paiement4,
        Paiement5,
        Paiement6,
        Paiement7,
        ExtraField1,
        ExtraField2,
        Montant_Credit,
        Montant_BA,
        CASE 
          WHEN PDF_Base64 IS NOT NULL AND PDF_Base64 != '' 
          THEN true 
          ELSE false 
        END as has_pdf
      FROM tickets
      WHERE Numero = ?
      LIMIT 1
    `;
        const [rows] = await pool.execute(query, [ticketNumero]);
        if (rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
            return;
        }
        res.status(200).json({
            status: 'ok',
            data: rows[0],
            count: 1
        });
    }
    catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch ticket'
        });
    }
};
exports.getTicketById = getTicketById;
// Récupérer le PDF d'un ticket spécifique
const getTicketPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT PDF_Base64, Numero, Date, Client_Nom
      FROM tickets
      WHERE Numero = ?
    `;
        const [rows] = await pool.execute(query, [id]);
        if (rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Ticket non trouvé'
            });
            return;
        }
        const ticket = rows[0];
        if (!ticket.PDF_Base64) {
            res.json({
                status: 'ok',
                has_pdf: false,
                message: 'Aucun PDF disponible pour ce ticket'
            });
            return;
        }
        const pdfBase64 = ticket.PDF_Base64.startsWith('data:application/pdf;base64,')
            ? ticket.PDF_Base64
            : `data:application/pdf;base64,${ticket.PDF_Base64}`;
        res.json({
            status: 'ok',
            has_pdf: true,
            pdf_base64: pdfBase64,
            filename: `${ticket.Numero}.pdf`
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du PDF:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération du PDF'
        });
    }
};
exports.getTicketPDF = getTicketPDF;
// Sauvegarder un PDF généré en base64
const saveTicketPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const { pdf_base64 } = req.body;
        if (!pdf_base64) {
            res.status(400).json({
                status: 'error',
                message: 'PDF base64 requis'
            });
            return;
        }
        // Nettoyer le base64 pour éviter le double encodage
        let cleanBase64 = pdf_base64;
        // Si le base64 contient déjà le préfixe data:, le nettoyer
        if (pdf_base64.startsWith('data:application/pdf;base64,')) {
            cleanBase64 = pdf_base64.replace('data:application/pdf;base64,', '');
        }
        console.log(`Sauvegarde PDF pour ticket ${id}, base64 nettoyé: ${cleanBase64.length} caractères`);
        const pool = (0, db_1.getPool)();
        const query = `
      UPDATE tickets 
      SET PDF_Base64 = ? 
      WHERE Numero = ?
    `;
        await pool.execute(query, [cleanBase64, id]);
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
};
exports.saveTicketPDF = saveTicketPDF;
// Générer et sauvegarder un PDF
const generateAndSaveTicketPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = (0, db_1.getPool)();
        // Récupérer les détails du ticket
        const ticketQuery = `
      SELECT * FROM tickets WHERE Numero = ?
    `;
        const [ticketRows] = await pool.execute(ticketQuery, [id]);
        if (ticketRows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Ticket non trouvé'
            });
            return;
        }
        const ticket = ticketRows[0];
        // Générer le PDF simple avec logo officiel
        const jsPDF = require('jspdf');
        const doc = new jsPDF();
        // === LOGO OFFICIEL PDF ===
        // En-tête professionnel
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('MEGA-CENTRAL', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Système de Centralisation des Ventes', 105, 30, { align: 'center' });
        // Ligne de séparation
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);
        // === INFORMATIONS TICKET ===
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TICKET DE CAISSE', 20, 55);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Numéro: ${ticket.Numero}`, 20, 70);
        doc.text(`Date: ${new Date(ticket.Date).toLocaleDateString('fr-FR')}`, 20, 80);
        doc.text(`Heure: ${ticket.Time || '00:00:00'}`, 20, 90);
        doc.text(`Caisse: ${ticket.Caisse}`, 20, 100);
        doc.text(`Client: ${ticket.Client_Nom || 'Client divers'}`, 20, 110);
        // Ligne de séparation
        doc.setLineWidth(0.3);
        doc.line(20, 120, 190, 120);
        // === MONTANTS ===
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DÉTAILS FINANCIERS', 20, 135);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total HT: ${parseFloat(ticket.Total_HT || 0).toFixed(2)} €`, 20, 150);
        doc.text(`Total TVA: ${parseFloat(ticket.Total_Tva || 0).toFixed(2)} €`, 20, 160);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total TTC: ${parseFloat(ticket.Total_TTC || 0).toFixed(2)} €`, 20, 175);
        // Ligne de séparation épaisse
        doc.setLineWidth(0.8);
        doc.line(20, 185, 190, 185);
        // === PIED DE PAGE ===
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Merci de votre visite', 105, 200, { align: 'center' });
        doc.text('Ticket non remboursable après départ', 105, 210, { align: 'center' });
        // Ligne de séparation
        doc.setLineWidth(0.3);
        doc.line(20, 220, 190, 220);
        // === INFO LÉGALES ===
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('MEGA-Central - Système de Centralisation des Ventes', 105, 235, { align: 'center' });
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 245, { align: 'center' });
        // Convertir en base64
        const pdfBase64 = doc.output('datauristring');
        // Sauvegarder en base
        await pool.execute('UPDATE tickets SET PDF_Base64 = ? WHERE Numero = ?', [pdfBase64, id]);
        res.json({
            status: 'ok',
            message: 'Ticket généré et sauvegardé avec succès',
            pdf_base64: pdfBase64,
            filename: `${ticket.Numero}.pdf`
        });
    }
    catch (error) {
        console.error('Erreur lors de la génération du ticket:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la génération du ticket'
        });
    }
};
exports.generateAndSaveTicketPDF = generateAndSaveTicketPDF;
