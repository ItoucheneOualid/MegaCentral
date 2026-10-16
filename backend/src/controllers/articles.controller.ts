import type { Request, Response } from 'express';
import { getPool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

type ArticleRow = RowDataPacket & {
  ARCLEUNIK: number;
  LIBELLE: string | null;
  Code_Barres: string | null;
  Prix_TTC1: number | null;
  Prix_Vente_HT: number | null;
  Prix_Achat_HT: number | null;
  Prix_Achat_TTC: number | null;
  F1_Cleunik: number | null;
  F2_CLEUNIK: number | null;
  TVA_CLEUNIK: number | null;
  FRN_CLEUNIK: number | null;
  famille1_libelle?: string | null;
  famille2_libelle?: string | null;
  tva_taux?: number | null;
  tva_description?: string | null;
  fournisseur_nom?: string | null;
  Photo_Name?: string | null;
  Photo_Base64?: string | null;
};

const articleSelectQuery = `
SELECT
  a.ARCLEUNIK,
  a.LIBELLE,
  a.Code_Barres,
  a.Prix_TTC1,
  a.Prix_Vente_HT,
  a.Prix_Achat_HT,
  a.Prix_Achat_TTC,
  a.F1_Cleunik,
  a.F2_CLEUNIK,
  a.TVA_CLEUNIK,
  a.FRN_CLEUNIK,
  f1.Description AS famille1_libelle,
  f2.Description AS famille2_libelle,
  t.Taux AS tva_taux,
  t.Description AS tva_description,
  fo.Nom_Societe AS fournisseur_nom,
  p.Photo_Name,
  p.Photo_Base64
FROM articles a
LEFT JOIN familles1 f1 ON a.F1_Cleunik = f1.F1cleunik
LEFT JOIN familles2 f2 ON a.F2_CLEUNIK = f2.F2CLEUNIK
LEFT JOIN tva t ON a.TVA_CLEUNIK = t.TVA_ID
LEFT JOIN fournis fo ON a.FRN_CLEUNIK = fo.FRCLEUNIK
LEFT JOIN fotos p ON a.ARCLEUNIK = p.ARCLEUNIK
`;

// Helpers
const toNumber = (value: unknown, defaultValue = 0): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : defaultValue;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const getNextArticleId = async (): Promise<number> => {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT MAX(ARCLEUNIK) AS maxId FROM articles');
  return Number(rows[0]?.maxId || 0) + 1;
};

// Controllers
export const getArticles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute<ArticleRow[]>(`
      ${articleSelectQuery}
      ORDER BY a.LIBELLE ASC
    `);
    res.status(200).json({
      status: 'ok',
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch articles',
    });
  }
};

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ status: 'error', message: 'Invalid article ID' });
      return;
    }

    const pool = getPool();
    const [rows] = await pool.execute<ArticleRow[]>(`
      ${articleSelectQuery}
      WHERE a.ARCLEUNIK = ?
      LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Article not found' });
      return;
    }

    res.status(200).json({
      status: 'ok',
      data: rows[0],
      count: 1,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch article',
    });
  }
};

export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      LIBELLE,
      Code_Barres,
      Prix_TTC1,
      Prix_Vente_HT,
      Prix_Achat_HT,
      Prix_Achat_TTC,
      F1_Cleunik,
      F2_CLEUNIK,
      TVA_CLEUNIK,
      FRN_CLEUNIK,
      FOUcleunik,
    } = req.body;

    if (!LIBELLE || String(LIBELLE).trim() === '') {
  res.status(400).json({
    status: 'error',
    message: "Le libellé de l'article est requis",
  });
  return;
}

if (
  Number(Prix_TTC1) < 0 ||
  Number(Prix_Vente_HT) < 0 ||
  Number(Prix_Achat_HT) < 0 ||
  Number(Prix_Achat_TTC) < 0
) {
  res.status(400).json({
    status: 'error',
    message: 'Les prix ne peuvent pas être négatifs',
  });
  return;
}

    const pool = getPool();
    const nextId = await getNextArticleId();
    const familleId = toNullableNumber(F2_CLEUNIK ?? F1_Cleunik);
    const fournisseurId = toNullableNumber(FRN_CLEUNIK ?? FOUcleunik);
    const tvaId = toNullableNumber(TVA_CLEUNIK);

    await pool.execute<ResultSetHeader>(
      `INSERT INTO articles (
        ARCLEUNIK,
        LIBELLE,
        Code_Barres,
        Prix_TTC1,
        Prix_Vente_HT,
        Prix_Achat_HT,
        Prix_Achat_TTC,
        F1_Cleunik,
        F2_CLEUNIK,
        TVA_CLEUNIK,
        FRN_CLEUNIK,
        \`Date_Modifiée\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nextId,
        String(LIBELLE).trim(),
        Code_Barres || null,
        toNumber(Prix_TTC1),
        toNumber(Prix_Vente_HT),
        toNumber(Prix_Achat_HT),
        toNumber(Prix_Achat_TTC),
        familleId,
        familleId,
        tvaId,
        fournisseurId,
      ]
    );

    const [newArticle] = await pool.execute<ArticleRow[]>(`
      ${articleSelectQuery}
      WHERE a.ARCLEUNIK = ?
      LIMIT 1
    `, [nextId]);

    res.status(201).json({
      status: 'ok',
      message: 'Article created successfully',
      data: newArticle[0],
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create article',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ status: 'error', message: 'Invalid article ID' });
      return;
    }

    const {
      LIBELLE,
      Code_Barres,
      Prix_TTC1,
      Prix_Vente_HT,
      Prix_Achat_HT,
      Prix_Achat_TTC,
      F1_Cleunik,
      F2_CLEUNIK,
      TVA_CLEUNIK,
      FRN_CLEUNIK,
      FOUcleunik,
    } = req.body;

    if (!LIBELLE || String(LIBELLE).trim() === '') {
  res.status(400).json({
    status: 'error',
    message: "Le libellé de l'article est requis",
  });
  return;
}

if (
  Number(Prix_TTC1) < 0 ||
  Number(Prix_Vente_HT) < 0 ||
  Number(Prix_Achat_HT) < 0 ||
  Number(Prix_Achat_TTC) < 0
) {
  res.status(400).json({
    status: 'error',
    message: 'Les prix ne peuvent pas être négatifs',
  });
  return;
}

    const pool = getPool();
    const [existingArticle] = await pool.execute<ArticleRow[]>(
      'SELECT ARCLEUNIK FROM articles WHERE ARCLEUNIK = ?',
      [id]
    );

    if (existingArticle.length === 0) {
      res.status(404).json({ status: 'error', message: 'Article not found' });
      return;
    }

    const familleId = toNullableNumber(F2_CLEUNIK ?? F1_Cleunik);
    const fournisseurId = toNullableNumber(FRN_CLEUNIK ?? FOUcleunik);
    const tvaId = toNullableNumber(TVA_CLEUNIK);

    await pool.execute<ResultSetHeader>(
      `UPDATE articles
      SET
        LIBELLE = ?,
        Code_Barres = ?,
        Prix_TTC1 = ?,
        Prix_Vente_HT = ?,
        Prix_Achat_HT = ?,
        Prix_Achat_TTC = ?,
        F1_Cleunik = ?,
        F2_CLEUNIK = ?,
        TVA_CLEUNIK = ?,
        FRN_CLEUNIK = ?,
        \`Date_Modifiée\` = NOW()
      WHERE ARCLEUNIK = ?`,
      [
        String(LIBELLE).trim(),
        Code_Barres || null,
        toNumber(Prix_TTC1),
        toNumber(Prix_Vente_HT),
        toNumber(Prix_Achat_HT),
        toNumber(Prix_Achat_TTC),
        familleId,
        familleId,
        tvaId,
        fournisseurId,
        id,
      ]
    );

    const [updatedArticle] = await pool.execute<ArticleRow[]>(`
      ${articleSelectQuery}
      WHERE a.ARCLEUNIK = ?
      LIMIT 1
    `, [id]);

    res.status(200).json({
      status: 'ok',
      message: 'Article updated successfully',
      data: updatedArticle[0],
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update article',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  const pool = getPool();

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid article ID',
      });
      return;
    }

    const [existingArticle] = await pool.execute<ArticleRow[]>(
      'SELECT ARCLEUNIK FROM articles WHERE ARCLEUNIK = ?',
      [id]
    );

    if (existingArticle.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Article not found',
      });
      return;
    }

    // Supprimer d'abord les données liées à l'article
    await pool.execute('DELETE FROM fotos WHERE ARCLEUNIK = ?', [id]);

    // Puis supprimer l'article
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM articles WHERE ARCLEUNIK = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Article not found',
      });
      return;
    }

    res.status(200).json({
      status: 'ok',
      message: 'Article deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting article:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete article',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};