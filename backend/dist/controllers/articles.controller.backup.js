"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadArticleImage = exports.updateArticle = exports.getArticleById = exports.getArticles = void 0;
const db_1 = require("../config/db");
const getArticles = async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        a.ARCLEUNIK,
        a.LIBELLE,
        a.Code_Barres,
        a.Prix_TTC1,
        a.Prix_Vente_HT,
        a.F1_Cleunik,
        a.F2_CLEUNIK,
        a.TVA_CLEUNIK,
        a.Qte_Min,
        a.Qte_Max,
        a.Gestion_Stock,
        a.Suspendu,
        a.Date_Modifiée,
        f1.Description as famille1_libelle,
        f2.Description as famille2_libelle,
        t.Taux as tva_taux,
        t.Description as tva_description
      FROM articles a
      LEFT JOIN familles1 f1 ON a.F1_Cleunik = f1.F1cleunik
      LEFT JOIN familles2 f2 ON a.F2_CLEUNIK = f2.F2CLEUNIK
      LEFT JOIN tva t ON a.TVA_CLEUNIK = t.TVA_ID
      ORDER BY a.LIBELLE ASC
    `;
        const [rows] = await pool.execute(query);
        res.status(200).json({
            status: 'ok',
            data: rows,
            count: rows.length
        });
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch articles'
        });
    }
};
exports.getArticles = getArticles;
const getArticleById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid article ID'
            });
            return;
        }
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        a.ARCLEUNIK,
        a.LIBELLE,
        a.Code_Barres,
        a.Prix_TTC1,
        a.Prix_Vente_HT,
        a.F1_Cleunik,
        a.F2_CLEUNIK,
        a.TVA_CLEUNIK,
        a.Qte_Min,
        a.Qte_Max,
        a.Gestion_Stock,
        a.Suspendu,
        a.Date_Modifiée,
        f1.Description as famille1_libelle,
        f2.Description as famille2_libelle,
        t.Taux as tva_taux,
        t.Description as tva_description
      FROM articles a
      LEFT JOIN familles1 f1 ON a.F1_Cleunik = f1.F1cleunik
      LEFT JOIN familles2 f2 ON a.F2_CLEUNIK = f2.F2CLEUNIK
      LEFT JOIN tva t ON a.TVA_CLEUNIK = t.TVA_ID
      WHERE a.ARCLEUNIK = ?
      LIMIT 1
    `;
        const [rows] = await pool.execute(query, [id]);
        if (rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Article not found'
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
        console.error('Error fetching article:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch article'
        });
    }
};
exports.getArticleById = getArticleById;
const updateArticle = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid article ID'
            });
            return;
        }
        const { LIBELLE, Code_Barres, Prix_Vente_HT, Prix_TTC1, Taux_TVA, F1_Cleunik, F2_CLEUNIK, Suspendu, Gestion_Stock } = req.body;
        const pool = (0, db_1.getPool)();
        // Pour l'instant, ignorer l'image et se concentrer sur les champs texte
        // TODO: Ajouter gestion d'image plus tard avec multer
        // Construire la requête de mise à jour
        const query = `
      UPDATE articles 
      SET 
        LIBELLE = ?, 
        Code_Barres = ?, 
        Prix_Vente_HT = ?, 
        Prix_TTC1 = ?, 
        TVA_CLEUNIK = ?, 
        F1_Cleunik = ?, 
        F2_CLEUNIK = ?, 
        Suspendu = ?, 
        Gestion_Stock = ?,
        Date_Modifiée = NOW()
      WHERE ARCLEUNIK = ?
    `;
        const params = [
            LIBELLE,
            Code_Barres || null,
            parseFloat(Prix_Vente_HT) || 0,
            parseFloat(Prix_TTC1) || 0,
            parseInt(Taux_TVA) || 0,
            parseInt(F1_Cleunik) || null,
            parseInt(F2_CLEUNIK) || null,
            parseInt(Suspendu) || 0,
            parseInt(Gestion_Stock) || 0,
            id
        ];
        await pool.execute(query, params);
        // Récupérer l'article mis à jour
        const [updatedRows] = await pool.execute(`
      SELECT 
        a.ARCLEUNIK,
        a.LIBELLE,
        a.Code_Barres,
        a.Prix_TTC1,
        a.Prix_Vente_HT,
        a.F1_Cleunik,
        a.F2_CLEUNIK,
        a.TVA_CLEUNIK,
        a.Qte_Min,
        a.Qte_Max,
        a.Gestion_Stock,
        a.Suspendu,
        a.Date_Modifiée,
        a.pdf_base64,
        f1.Description as famille1_libelle,
        f2.Description as famille2_libelle,
        t.Taux as tva_taux,
        t.Description as tva_description
      FROM articles a
      LEFT JOIN familles1 f1 ON a.F1_Cleunik = f1.F1cleunik
      LEFT JOIN familles2 f2 ON a.F2_CLEUNIK = f2.F2CLEUNIK
      LEFT JOIN tva t ON a.TVA_CLEUNIK = t.TVA_ID
      WHERE a.ARCLEUNIK = ?
      LIMIT 1
    `, [id]);
        res.status(200).json({
            status: 'ok',
            message: 'Article updated successfully',
            data: updatedRows[0]
        });
    }
    catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update article',
            error: error.message
        });
    }
};
exports.updateArticle = updateArticle;
// Exporter le middleware upload pour les routes
exports.uploadArticleImage = upload.single('image');
//# sourceMappingURL=articles.controller.backup.js.map