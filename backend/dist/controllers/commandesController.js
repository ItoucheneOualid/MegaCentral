"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandesController = void 0;
const databaseService_1 = require("../services/databaseService");
class CommandesController {
    static async getNextCommandeId() {
        const result = await databaseService_1.DatabaseService.query('SELECT MAX(CFCLEUNIK) AS maxId FROM BC_FRN');
        return Number(result[0]?.maxId || 0) + 1;
    }
    static async getNextLigneId() {
        const result = await databaseService_1.DatabaseService.query('SELECT MAX(BLCLEUNIK) AS maxId FROM BC_Lignes');
        return Number(result[0]?.maxId || 0) + 1;
    }
    static async getFournisseurs(req, res) {
        try {
            const fournisseurs = await databaseService_1.DatabaseService.query(`
        SELECT
          FRCLEUNIK AS id,
          Fournis_No AS code,
          Nom_Societe AS nom,
          COALESCE(Email_Adresse, '') AS email,
          COALESCE(Telephone, '') AS telephone,
          COALESCE(Localite, '') AS ville
        FROM fournis
        ORDER BY Nom_Societe ASC
      `);
            res.json({
                success: true,
                data: fournisseurs,
                count: fournisseurs.length,
            });
        }
        catch (error) {
            console.error('Erreur getFournisseurs commandes:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des fournisseurs',
            });
        }
    }
    static async getArticlesCommandables(req, res) {
        try {
            const articles = await databaseService_1.DatabaseService.query(`
        SELECT
          ARCLEUNIK AS id,
          LIBELLE AS libelle,
          Code_Barres AS codeBarres,
          COALESCE(Prix_Achat_HT, 0) AS prixAchatHT,
          COALESCE(Prix_Achat_TTC, 0) AS prixAchatTTC,
          COALESCE(Prix_Vente_HT, 0) AS prixVenteHT,
          TVA_CLEUNIK AS tvaId,
          FRN_CLEUNIK AS fournisseurId
        FROM articles
        WHERE LIBELLE IS NOT NULL
        ORDER BY LIBELLE ASC
        LIMIT 2000
      `);
            res.json({
                success: true,
                data: articles,
                count: articles.length,
            });
        }
        catch (error) {
            console.error('Erreur getArticlesCommandables:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des articles',
            });
        }
    }
    static async getAllCommandes(req, res) {
        try {
            const commandes = await databaseService_1.DatabaseService.query(`
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
        FROM BC_FRN bc
        ORDER BY bc.Date_Commande DESC
      `);
            for (const commande of commandes) {
                const lignes = await databaseService_1.DatabaseService.query(`
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
            Ligne_no AS ligneNo,
            Code2 AS code2
          FROM BC_Lignes
          WHERE CFCLEUNIK = ?
          ORDER BY Ligne_no ASC
          `, [commande.id]);
                commande.lignes = lignes;
            }
            res.json({
                success: true,
                data: commandes,
                count: commandes.length,
            });
        }
        catch (error) {
            console.error('Erreur getAllCommandes:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des commandes',
            });
        }
    }
    static async getCommandeById(req, res) {
        try {
            const { id } = req.params;
            const commandes = await databaseService_1.DatabaseService.query(`
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
        FROM BC_FRN bc
        WHERE bc.CFCLEUNIK = ?
        `, [id]);
            if (commandes.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Commande non trouvée',
                });
            }
            const commande = commandes[0];
            commande.lignes = await databaseService_1.DatabaseService.query(`
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
          Ligne_no AS ligneNo,
          Code2 AS code2
        FROM BC_Lignes
        WHERE CFCLEUNIK = ?
        ORDER BY Ligne_no ASC
        `, [id]);
            res.json({
                success: true,
                data: commande,
            });
        }
        catch (error) {
            console.error('Erreur getCommandeById:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de la commande',
            });
        }
    }
    static async createCommande(req, res) {
        try {
            const { idFournisseur, fournisseurCode, nomFournisseur, dateCommande, dateLivraisonPrevue, statut, notes, lignes, } = req.body;
            if (!idFournisseur || !nomFournisseur || !dateCommande) {
                return res.status(400).json({
                    success: false,
                    error: 'Fournisseur et date de commande requis',
                });
            }
            if (!Array.isArray(lignes) || lignes.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'La commande doit contenir au moins une ligne',
                });
            }
            const commandeId = await CommandesController.getNextCommandeId();
            let ligneId = await CommandesController.getNextLigneId();
            let totalHT = 0;
            let totalTVA = 0;
            let totalTTC = 0;
            for (const ligne of lignes) {
                const quantite = Number(ligne.quantite || 0);
                const prixUnitaire = Number(ligne.prixUnitaire || 0);
                const tauxTVA = Number(ligne.tauxTVA || 21);
                if (quantite <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'La quantité doit être supérieure à 0',
                    });
                }
                if (prixUnitaire < 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Le prix unitaire ne peut pas être négatif',
                    });
                }
                const ligneHT = quantite * prixUnitaire;
                const ligneTVA = ligneHT * (tauxTVA / 100);
                const ligneTTC = ligneHT + ligneTVA;
                totalHT += ligneHT;
                totalTVA += ligneTVA;
                totalTTC += ligneTTC;
            }
            const statutValue = typeof statut === 'string' && statut.length > 0
                ? statut.charAt(0)
                : 'N';
            await databaseService_1.DatabaseService.query(`
        INSERT INTO BC_FRN (
          CFCLEUNIK,
          FRCLEUNIK,
          Fournis_No,
          Fournis_Nom,
          Date_Commande,
          Date_Livraison,
          Total_HT_Brut,
          Total_HT_Net,
          Total_Brut,
          Total_Tva,
          Total_TTC,
          Remise_PC,
          Remise,
          Etat,
          Type_TVA,
          Remarques,
          Derniere_MAJ
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
        `, [
                commandeId,
                idFournisseur,
                fournisseurCode || null,
                nomFournisseur,
                dateCommande,
                dateLivraisonPrevue || null,
                totalHT,
                totalHT,
                totalHT,
                totalTVA,
                totalTTC,
                0,
                0,
                statutValue,
                1,
                notes || null,
            ]);
            for (const [index, ligne] of lignes.entries()) {
                const quantite = Number(ligne.quantite || 0);
                const prixUnitaire = Number(ligne.prixUnitaire || 0);
                const tauxTVA = Number(ligne.tauxTVA || 21);
                const currentLigneId = ligneId++;
                await databaseService_1.DatabaseService.query(`
          INSERT INTO BC_Lignes (
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
          `, [
                    currentLigneId,
                    currentLigneId,
                    commandeId,
                    ligne.idArticle || null,
                    ligne.designation || null,
                    quantite,
                    prixUnitaire,
                    tauxTVA,
                    'A',
                    0,
                    0,
                    null,
                    null,
                    String(index + 1),
                    ligne.magasinId ? String(ligne.magasinId) : null,
                ]);
            }
            const createdCommandes = await databaseService_1.DatabaseService.query(`
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
        FROM BC_FRN bc
        WHERE bc.CFCLEUNIK = ?
        `, [commandeId]);
            const createdCommande = createdCommandes[0];
            createdCommande.lignes = await databaseService_1.DatabaseService.query(`
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
          Ligne_no AS ligneNo,
          Code2 AS code2
        FROM BC_Lignes
        WHERE CFCLEUNIK = ?
        ORDER BY Ligne_no ASC
        `, [commandeId]);
            res.status(201).json({
                success: true,
                data: createdCommande,
            });
        }
        catch (error) {
            console.error('Erreur createCommande:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de la commande',
                detail: error instanceof Error ? error.message : 'Erreur inconnue',
            });
        }
    }
    static async updateStatutCommande(req, res) {
        try {
            const { id } = req.params;
            const { statut } = req.body;
            const statutsAutorises = ['N', 'C', 'L', 'R', 'A'];
            if (!statutsAutorises.includes(statut)) {
                return res.status(400).json({
                    success: false,
                    error: 'Statut invalide',
                });
            }
            const existing = await databaseService_1.DatabaseService.query(`
        SELECT Etat
        FROM BC_FRN
        WHERE CFCLEUNIK = ?
        LIMIT 1
        `, [id]);
            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Commande non trouvée',
                });
            }
            const ancienStatut = existing[0].Etat;
            if (ancienStatut === 'R' && statut !== 'R') {
                return res.status(400).json({
                    success: false,
                    error: 'Une commande réceptionnée ne peut plus changer de statut.',
                });
            }
            await databaseService_1.DatabaseService.query(`
        UPDATE BC_FRN
        SET Etat = ?, Derniere_MAJ = CURDATE()
        WHERE CFCLEUNIK = ?
        `, [statut, id]);
            res.json({
                success: true,
                message: statut === 'R'
                    ? 'Commande réceptionnée. Le schéma MegaCaisse ne stocke pas les quantités disponibles par magasin ; le stock n’a pas été modifié.'
                    : 'Statut mis à jour avec succès',
            });
        }
        catch (error) {
            console.error('Erreur updateStatutCommande:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour du statut',
                detail: error instanceof Error ? error.message : 'Erreur inconnue',
            });
        }
    }
    static async updateCommande(req, res) {
        try {
            const { id } = req.params;
            const { idFournisseur, fournisseurCode, nomFournisseur, dateCommande, dateLivraisonPrevue, statut, notes, lignes, } = req.body;
            if (!idFournisseur || !nomFournisseur || !dateCommande) {
                return res.status(400).json({
                    success: false,
                    error: 'Fournisseur et date de commande requis',
                });
            }
            if (!Array.isArray(lignes) || lignes.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'La commande doit contenir au moins une ligne',
                });
            }
            const existing = await databaseService_1.DatabaseService.query('SELECT Etat FROM BC_FRN WHERE CFCLEUNIK = ?', [id]);
            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Commande non trouvée',
                });
            }
            if (existing[0].Etat === 'R') {
                return res.status(400).json({
                    success: false,
                    error: 'Une commande réceptionnée ne peut plus être modifiée',
                });
            }
            let totalHT = 0;
            let totalTVA = 0;
            let totalTTC = 0;
            for (const ligne of lignes) {
                const quantite = Number(ligne.quantite || 0);
                const prixUnitaire = Number(ligne.prixUnitaire || 0);
                const tauxTVA = Number(ligne.tauxTVA || 21);
                if (quantite <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'La quantité doit être supérieure à 0',
                    });
                }
                if (prixUnitaire < 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Le prix unitaire ne peut pas être négatif',
                    });
                }
                const ligneHT = quantite * prixUnitaire;
                const ligneTVA = ligneHT * (tauxTVA / 100);
                const ligneTTC = ligneHT + ligneTVA;
                totalHT += ligneHT;
                totalTVA += ligneTVA;
                totalTTC += ligneTTC;
            }
            await databaseService_1.DatabaseService.query(`
        UPDATE BC_FRN
        SET
          FRCLEUNIK = ?,
          Fournis_No = ?,
          Fournis_Nom = ?,
          Date_Commande = ?,
          Date_Livraison = ?,
          Total_HT_Brut = ?,
          Total_HT_Net = ?,
          Total_Brut = ?,
          Total_Tva = ?,
          Total_TTC = ?,
          Etat = ?,
          Remarques = ?,
          Derniere_MAJ = CURDATE()
        WHERE CFCLEUNIK = ?
        `, [
                idFournisseur,
                fournisseurCode || null,
                nomFournisseur,
                dateCommande,
                dateLivraisonPrevue || null,
                totalHT,
                totalHT,
                totalHT,
                totalTVA,
                totalTTC,
                statut || 'N',
                notes || null,
                id,
            ]);
            await databaseService_1.DatabaseService.query('DELETE FROM BC_Lignes WHERE CFCLEUNIK = ?', [
                id,
            ]);
            let ligneId = await CommandesController.getNextLigneId();
            for (const [index, ligne] of lignes.entries()) {
                const currentLigneId = ligneId++;
                await databaseService_1.DatabaseService.query(`
          INSERT INTO BC_Lignes (
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
          `, [
                    currentLigneId,
                    currentLigneId,
                    id,
                    ligne.idArticle || null,
                    ligne.designation || null,
                    Number(ligne.quantite || 0),
                    Number(ligne.prixUnitaire || 0),
                    Number(ligne.tauxTVA || 21),
                    'A',
                    0,
                    0,
                    null,
                    null,
                    String(index + 1),
                    ligne.magasinId ? String(ligne.magasinId) : null,
                ]);
            }
            res.json({
                success: true,
                message: 'Commande modifiée avec succès',
            });
        }
        catch (error) {
            console.error('Erreur updateCommande:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la modification de la commande',
                detail: error instanceof Error ? error.message : 'Erreur inconnue',
            });
        }
    }
    static async deleteCommande(req, res) {
        try {
            const { id } = req.params;
            await databaseService_1.DatabaseService.query('DELETE FROM BC_Lignes WHERE CFCLEUNIK = ?', [
                id,
            ]);
            await databaseService_1.DatabaseService.query('DELETE FROM BC_FRN WHERE CFCLEUNIK = ?', [
                id,
            ]);
            res.json({
                success: true,
                message: 'Commande supprimée avec succès',
            });
        }
        catch (error) {
            console.error('Erreur deleteCommande:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de la commande',
            });
        }
    }
    static async exportCommandesCSV(req, res) {
        try {
            const commandes = await databaseService_1.DatabaseService.query(`
        SELECT
          bc.CFCLEUNIK AS 'Numéro',
          bc.Fournis_Nom AS 'Fournisseur',
          bc.Date_Commande AS 'Date Commande',
          bc.Date_Livraison AS 'Date Livraison Prévue',
          bc.Etat AS 'Statut',
          bc.Total_HT_Net AS 'Montant HT',
          bc.Total_Tva AS 'Montant TVA',
          bc.Total_TTC AS 'Montant TTC'
        FROM BC_FRN bc
        ORDER BY bc.Date_Commande DESC
      `);
            if (commandes.length === 0) {
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="commandes_${new Date().toISOString().split('T')[0]}.csv"`);
                return res.send('\uFEFF');
            }
            const csvHeader = Object.keys(commandes[0]).join(';');
            const csvRows = commandes.map((row) => Object.values(row)
                .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
                .join(';'));
            const csvContent = '\uFEFF' + [csvHeader, ...csvRows].join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="commandes_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);
        }
        catch (error) {
            console.error('Erreur exportCommandesCSV:', error);
            res.status(500).json({
                success: false,
                error: "Erreur lors de l'export CSV",
            });
        }
    }
}
exports.CommandesController = CommandesController;
