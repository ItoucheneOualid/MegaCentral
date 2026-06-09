"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandesController = void 0;
const databaseService_1 = require("../services/databaseService");
class CommandesController {
    static async getNextCommandeId() {
        const result = await databaseService_1.DatabaseService.query('SELECT MAX(CFCLEUNIK) AS maxId FROM bc_frn');
        return Number(result[0]?.maxId || 0) + 1;
    }
    static async getNextLigneId() {
        const result = await databaseService_1.DatabaseService.query('SELECT MAX(BLCLEUNIK) AS maxId FROM bc_lignes');
        return Number(result[0]?.maxId || 0) + 1;
    }
    // Récupérer toutes les commandes depuis bc_frn
    static async getAllCommandes(req, res) {
        try {
            const query = `
        SELECT
          bc.CFCLEUNIK AS id,
          bc.FRCLEUNIK AS idFournisseur,
          bc.Fournis_No AS fournisseurCode,
          bc.Fournis_Nom AS nomFournisseur,
          bc.Date_Commande AS dateCommande,
          bc.Date_Livraison AS dateLivraisonPrevue,
          bc.Etat AS statut,
          bc.Total_HT_Net AS montantHT,
          bc.Total_Tva AS montantTVA,
          bc.Total_TTC AS montantTTC,
          bc.Remarques AS notes
        FROM bc_frn bc
        ORDER BY bc.Date_Commande DESC
      `;
            const commandes = await databaseService_1.DatabaseService.query(query);
            for (const commande of commandes) {
                const lignesQuery = `
          SELECT
            BLCLEUNIK AS id,
            ARCLEUNIK AS idArticle,
            LIBELLE AS designation,
            Quantite AS quantite,
            Prix_Un AS prixUnitaire,
            Taux_Tva AS tauxTVA,
            Quantite * Prix_Un AS totalHT,
            Quantite * Prix_Un * (1 + COALESCE(Taux_Tva, 0) / 100) AS totalTTC,
            Nature AS nature,
            Remise AS remise,
            Remise_PC AS remisePourcent,
            Qte_de_boites AS qteDeBoites,
            Qte_par_boite AS qteParBoite,
            Ligne_no AS ligneNo,
            Code2 AS code2
          FROM bc_lignes
          WHERE CFCLEUNIK = ?
          ORDER BY Ligne_no ASC
        `;
                const lignes = await databaseService_1.DatabaseService.query(lignesQuery, [commande.id]);
                commande.lignes = lignes;
            }
            res.json({
                success: true,
                data: commandes,
                count: commandes.length
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des commandes :', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des commandes'
            });
        }
    }
    // Récupérer une commande par son ID
    static async getCommandeById(req, res) {
        try {
            const { id } = req.params;
            const query = `
        SELECT
          bc.CFCLEUNIK AS id,
          bc.FRCLEUNIK AS idFournisseur,
          bc.Fournis_No AS fournisseurCode,
          bc.Fournis_Nom AS nomFournisseur,
          bc.Date_Commande AS dateCommande,
          bc.Date_Livraison AS dateLivraisonPrevue,
          bc.Etat AS statut,
          bc.Total_HT_Net AS montantHT,
          bc.Total_Tva AS montantTVA,
          bc.Total_TTC AS montantTTC,
          bc.Remarques AS notes
        FROM bc_frn bc
        WHERE bc.CFCLEUNIK = ?
      `;
            const commandes = await databaseService_1.DatabaseService.query(query, [id]);
            if (commandes.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Commande non trouvée'
                });
            }
            const commande = commandes[0];
            const lignesQuery = `
        SELECT
          BLCLEUNIK AS id,
          ARCLEUNIK AS idArticle,
          LIBELLE AS designation,
          Quantite AS quantite,
          Prix_Un AS prixUnitaire,
          Taux_Tva AS tauxTVA,
          Quantite * Prix_Un AS totalHT,
          Quantite * Prix_Un * (1 + COALESCE(Taux_Tva, 0) / 100) AS totalTTC,
          Nature AS nature,
          Remise AS remise,
          Remise_PC AS remisePourcent,
          Qte_de_boites AS qteDeBoites,
          Qte_par_boite AS qteParBoite,
          Ligne_no AS ligneNo,
          Code2 AS code2
        FROM bc_lignes
        WHERE CFCLEUNIK = ?
        ORDER BY Ligne_no ASC
      `;
            const lignes = await databaseService_1.DatabaseService.query(lignesQuery, [id]);
            commande.lignes = lignes;
            res.json({
                success: true,
                data: commande
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération de la commande :', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de la commande'
            });
        }
    }
    // Créer une nouvelle commande fournisseur
    static async createCommande(req, res) {
        try {
            const { idFournisseur, fournisseurCode, nomFournisseur, dateCommande, dateLivraisonPrevue, statut, notes, totalHT, totalTVA, totalTTC, lignes } = req.body;
            if (!idFournisseur || !nomFournisseur || !dateCommande) {
                return res.status(400).json({
                    success: false,
                    error: 'idFournisseur, nomFournisseur et dateCommande sont requis'
                });
            }
            if (!Array.isArray(lignes) || lignes.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'La commande doit contenir au moins une ligne'
                });
            }
            const commandeId = await CommandesController.getNextCommandeId();
            let ligneId = await CommandesController.getNextLigneId();
            await databaseService_1.DatabaseService.query(`INSERT INTO bc_frn (
          CFCLEUNIK,
          FRCLEUNIK,
          Fournis_No,
          Fournis_Nom,
          Date_Commande,
          Date_Livraison,
          Total_HT_Net,
          Total_Tva,
          Total_TTC,
          Etat,
          Remarques,
          Derniere_MAJ
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
                commandeId,
                idFournisseur,
                fournisseurCode || null,
                nomFournisseur,
                dateCommande,
                dateLivraisonPrevue || null,
                totalHT ?? 0,
                totalTVA ?? 0,
                totalTTC ?? 0,
                statut || 'Nouveau',
                notes || null
            ]);
            const insertedLignes = [];
            for (const [index, ligne] of lignes.entries()) {
                const { idArticle, designation, quantite, prixUnitaire, tauxTVA, nature, remise, remisePourcent, qteDeBoites, qteParBoite, code2 } = ligne;
                const currentLigneId = ligneId++;
                await databaseService_1.DatabaseService.query(`INSERT INTO bc_lignes (
            BLCLEUNIK,
            CCCLEUNIK,
            CFCLEUNIK,
            ARCLEUNIK,
            LIBELLE,
            Quantite,
            Prix_Un,
            Taux_Tva,
            Nature,
            Remise,
            Remise_PC,
            Qte_de_boites,
            Qte_par_boite,
            Ligne_no,
            Code2,
            Derniere_MAJ
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
                    currentLigneId,
                    currentLigneId,
                    commandeId,
                    idArticle || null,
                    designation || null,
                    quantite ?? 0,
                    prixUnitaire ?? 0,
                    tauxTVA ?? 0,
                    nature || null,
                    remise ?? 0,
                    remisePourcent ?? 0,
                    qteDeBoites ?? null,
                    qteParBoite ?? null,
                    index + 1,
                    code2 || null
                ]);
                insertedLignes.push({
                    id: currentLigneId,
                    idArticle: idArticle || null,
                    designation: designation || null,
                    quantite: quantite ?? 0,
                    prixUnitaire: prixUnitaire ?? 0,
                    tauxTVA: tauxTVA ?? 0,
                    nature: nature || null,
                    remise: remise ?? 0,
                    remisePourcent: remisePourcent ?? 0,
                    qteDeBoites: qteDeBoites ?? null,
                    qteParBoite: qteParBoite ?? null,
                    ligneNo: index + 1,
                    code2: code2 || null
                });
            }
            const createdCommandeQuery = `
        SELECT
          bc.CFCLEUNIK AS id,
          bc.FRCLEUNIK AS idFournisseur,
          bc.Fournis_No AS fournisseurCode,
          bc.Fournis_Nom AS nomFournisseur,
          bc.Date_Commande AS dateCommande,
          bc.Date_Livraison AS dateLivraisonPrevue,
          bc.Etat AS statut,
          bc.Total_HT_Net AS montantHT,
          bc.Total_Tva AS montantTVA,
          bc.Total_TTC AS montantTTC,
          bc.Remarques AS notes
        FROM bc_frn bc
        WHERE bc.CFCLEUNIK = ?
      `;
            const createdCommandes = await databaseService_1.DatabaseService.query(createdCommandeQuery, [commandeId]);
            const createdCommande = createdCommandes[0] || null;
            if (!createdCommande) {
                return res.status(500).json({
                    success: false,
                    error: 'Commande créée mais impossible de la récupérer'
                });
            }
            const lignesQuery = `
        SELECT
          BLCLEUNIK AS id,
          ARCLEUNIK AS idArticle,
          LIBELLE AS designation,
          Quantite AS quantite,
          Prix_Un AS prixUnitaire,
          Taux_Tva AS tauxTVA,
          Quantite * Prix_Un AS totalHT,
          Quantite * Prix_Un * (1 + COALESCE(Taux_Tva, 0) / 100) AS totalTTC,
          Nature AS nature,
          Remise AS remise,
          Remise_PC AS remisePourcent,
          Qte_de_boites AS qteDeBoites,
          Qte_par_boite AS qteParBoite,
          Ligne_no AS ligneNo,
          Code2 AS code2
        FROM bc_lignes
        WHERE CFCLEUNIK = ?
        ORDER BY Ligne_no ASC
      `;
            createdCommande.lignes = await databaseService_1.DatabaseService.query(lignesQuery, [commandeId]);
            res.status(201).json({
                success: true,
                data: createdCommande
            });
        }
        catch (error) {
            console.error('Erreur lors de la création de la commande :', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de la commande'
            });
        }
    }
    // Exporter les commandes en CSV
    static async exportCommandesCSV(req, res) {
        try {
            const { search, statut } = req.query;
            let whereClause = 'WHERE 1=1';
            if (search) {
                whereClause += ` AND (bc.CFCLEUNIK LIKE '%${search}%' OR bc.Fournis_Nom LIKE '%${search}%')`;
            }
            if (statut) {
                whereClause += ` AND bc.Etat = '${statut}'`;
            }
            const query = `
        SELECT
          bc.CFCLEUNIK AS 'Numéro',
          bc.Fournis_Nom AS 'Fournisseur',
          bc.Date_Commande AS 'Date Commande',
          bc.Date_Livraison AS 'Date Livraison Prévue',
          bc.Etat AS 'Statut',
          bc.Total_HT_Net AS 'Montant HT',
          bc.Total_Tva AS 'Montant TVA',
          bc.Total_TTC AS 'Montant TTC'
        FROM bc_frn bc
        ${whereClause}
        ORDER BY bc.Date_Commande DESC
      `;
            const commandes = await databaseService_1.DatabaseService.query(query);
            if (commandes.length === 0) {
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="commandes_${new Date().toISOString().split('T')[0]}.csv"`);
                return res.send('\uFEFF');
            }
            const csvHeader = Object.keys(commandes[0]).join(';');
            const csvRows = commandes.map((c) => Object.values(c).join(';'));
            const csvContent = [csvHeader, ...csvRows].join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="commandes_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send('\uFEFF' + csvContent);
        }
        catch (error) {
            console.error("Erreur lors de l'export CSV des commandes :", error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'export CSV'
            });
        }
    }
}
exports.CommandesController = CommandesController;
