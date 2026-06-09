"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFamille2ById = exports.getFamilles2 = exports.getFamille1ById = exports.getFamilles1 = void 0;
const db_1 = require("../config/db");
const getFamilles1 = async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        F1cleunik,
        Description,
        Derniere_MAJ
      FROM familles1
      ORDER BY Description ASC
    `;
        const [rows] = await pool.execute(query);
        res.status(200).json({
            status: 'ok',
            data: rows,
            count: rows.length
        });
    }
    catch (error) {
        console.error('Error fetching familles1:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch familles1'
        });
    }
};
exports.getFamilles1 = getFamilles1;
const getFamille1ById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid famille1 ID'
            });
            return;
        }
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        F1cleunik,
        Description,
        Derniere_MAJ
      FROM familles1
      WHERE F1cleunik = ?
    `;
        const [rows] = await pool.execute(query, [id]);
        if (rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Famille1 not found'
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
        console.error('Error fetching famille1 by ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch famille1'
        });
    }
};
exports.getFamille1ById = getFamille1ById;
const getFamilles2 = async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        f2.F2CLEUNIK,
        f2.Description,
        f2.F1CLEUNIK,
        f2.Remise_PC,
        f1.Description as famille1_libelle
      FROM familles2 f2
      LEFT JOIN familles1 f1 ON f2.F1CLEUNIK = f1.F1cleunik
      ORDER BY f1.Description ASC, f2.Description ASC
    `;
        const [rows] = await pool.execute(query);
        res.status(200).json({
            status: 'ok',
            data: rows,
            count: rows.length
        });
    }
    catch (error) {
        console.error('Error fetching familles2:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch familles2'
        });
    }
};
exports.getFamilles2 = getFamilles2;
const getFamille2ById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid famille2 ID'
            });
            return;
        }
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT 
        f2.F2CLEUNIK,
        f2.Description,
        f2.F1CLEUNIK,
        f2.Remise_PC,
        f1.Description as famille1_libelle
      FROM familles2 f2
      LEFT JOIN familles1 f1 ON f2.F1CLEUNIK = f1.F1cleunik
      WHERE f2.F2CLEUNIK = ?
    `;
        const [rows] = await pool.execute(query, [id]);
        if (rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Famille2 not found'
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
        console.error('Error fetching famille2 by ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch famille2'
        });
    }
};
exports.getFamille2ById = getFamille2ById;
