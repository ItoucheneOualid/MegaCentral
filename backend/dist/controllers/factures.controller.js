"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFactureById = exports.getFactures = void 0;
const db_1 = require("../config/db");
const getFactures = async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        VTCLEUNIK,
        Numero,
        Date,
        Type,
        Client_No,
        Client_Nom,
        Total_B_HT,
        Total_N_HT,
        Total_Tva,
        Total_TTC,
        Devise,
        Paiements,
        Solde,
        Remises,
        Remise_pc,
        Benefice,
        Etat,
        Adresse1,
        Adresse2,
        CP,
        Ville,
        NbrArticles,
        SECLEUNIK,
        CACLEUNIK,
        Caisse_No,
        Code_magasin,
        Peppol_Statut,
        Remarques
      FROM ventes
      ORDER BY Date DESC, VTCLEUNIK DESC
    `;
        const [rows] = await pool.execute(query);
        res.status(200).json({
            status: 'ok',
            data: rows,
            count: rows.length
        });
    }
    catch (error) {
        console.error('Error fetching factures:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch factures'
        });
    }
};
exports.getFactures = getFactures;
const getFactureById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid facture ID'
            });
            return;
        }
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        VTCLEUNIK,
        Numero,
        Date,
        Type,
        Client_No,
        Client_Nom,
        Total_B_HT,
        Total_N_HT,
        Total_Tva,
        Total_TTC,
        Devise,
        Cours_DP,
        Paiements,
        Solde,
        Remises,
        Remise_pc,
        Benefice,
        Tva_code,
        Base_imp1,
        Base_imp2,
        Base_imp3,
        Base_imp4,
        Echeance,
        Liv_Date,
        Leur_ref,
        Etat,
        Adresse1,
        Adresse2,
        CP,
        Ville,
        NbrArticles,
        Prix_Sont_TTC,
        Prix_Groupe,
        SECLEUNIK,
        CACLEUNIK,
        Caisse_No,
        Code_magasin,
        Peppol_Statut,
        Remarques
      FROM ventes
      WHERE VTCLEUNIK = ?
      LIMIT 1
    `;
        const [rows] = await pool.execute(query, [id]);
        if (rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Facture not found'
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
        console.error('Error fetching facture:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch facture'
        });
    }
};
exports.getFactureById = getFactureById;
//# sourceMappingURL=factures.controller.js.map