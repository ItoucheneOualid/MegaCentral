import type { Request, Response } from 'express';
import { getPool } from '../config/db';
import type { RowDataPacket } from 'mysql2/promise';

type Famille1Row = RowDataPacket & {
  F1cleunik: number;
  Description: string;
  Derniere_MAJ: string | null;
};

type Famille2Row = RowDataPacket & {
  F2CLEUNIK: number;
  Description: string;
  F1CLEUNIK: number;
  Remise_PC: number;
  famille1_libelle?: string;
};

export const getFamilles1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();

    const query = `
      SELECT 
        F1cleunik,
        Description,
        Derniere_MAJ
      FROM familles1
      ORDER BY Description ASC
    `;

    const [rows] = await pool.execute<Famille1Row[]>(query);

    res.status(200).json({
      status: 'ok',
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching familles1:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch familles1'
    });
  }
};

export const getFamille1ById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid famille1 ID'
      });
      return;
    }

    const pool = getPool();

    const query = `
      SELECT 
        F1cleunik,
        Description,
        Derniere_MAJ
      FROM familles1
      WHERE F1cleunik = ?
    `;

    const [rows] = await pool.execute<Famille1Row[]>(query, [id]);

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
  } catch (error) {
    console.error('Error fetching famille1 by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch famille1'
    });
  }
};

export const getFamilles2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();

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

    const [rows] = await pool.execute<Famille2Row[]>(query);

    res.status(200).json({
      status: 'ok',
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching familles2:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch familles2'
    });
  }
};

export const getFamille2ById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid famille2 ID'
      });
      return;
    }

    const pool = getPool();

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

    const [rows] = await pool.execute<Famille2Row[]>(query, [id]);

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
  } catch (error) {
    console.error('Error fetching famille2 by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch famille2'
    });
  }
};
