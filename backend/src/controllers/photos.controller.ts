import type { Request, Response } from 'express';
import { getPool } from '../config/db';

export const getPhotoByArticleId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.execute(
      `
      SELECT ARCLEUNIK, Photo_Name, Photo_Base64
      FROM fotos
      WHERE ARCLEUNIK = ?
      LIMIT 1
      `,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(200).json({
        status: 'ok',
        data: null,
        message: 'Aucune photo disponible',
      });
      return;
    }

    res.status(200).json({
      status: 'ok',
      data: rows[0],
    });
  } catch (error) {
    console.error('Erreur getPhotoByArticleId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération de la photo',
    });
  }
};

export const addPhotoToArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { Photo_Name, Photo_Base64 } = req.body;

    if (!id || !Photo_Name || !Photo_Base64) {
      res.status(400).json({
        status: 'error',
        message: 'Article, nom photo et base64 requis',
      });
      return;
    }

    const pool = getPool();

    const [existingPhotos] = await pool.execute(
      'SELECT ARCLEUNIK FROM fotos WHERE ARCLEUNIK = ? LIMIT 1',
      [id]
    );

    if (Array.isArray(existingPhotos) && existingPhotos.length > 0) {
      await pool.execute(
        `
        UPDATE fotos
        SET Photo_Name = ?, Photo_Base64 = ?, Derniere_MAJ = CURDATE()
        WHERE ARCLEUNIK = ?
        `,
        [Photo_Name, Photo_Base64, id]
      );
    } else {
      await pool.execute(
        `
        INSERT INTO fotos (ARCLEUNIK, Photo_Name, Photo_Base64, Derniere_MAJ)
        VALUES (?, ?, ?, CURDATE())
        `,
        [id, Photo_Name, Photo_Base64]
      );
    }

    res.status(200).json({
      status: 'ok',
      message: 'Photo enregistrée avec succès',
    });
  } catch (error) {
    console.error('Erreur addPhotoToArticle:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de l’enregistrement de la photo',
    });
  }
};