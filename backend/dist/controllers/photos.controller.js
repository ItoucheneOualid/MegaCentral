"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPhotoToArticle = void 0;
const db_1 = require("../config/db");
const addPhotoToArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { Photo_Base64, Photo_Name } = req.body;
        if (!Photo_Base64 || !Photo_Name) {
            res.status(400).json({
                status: 'error',
                message: 'Photo_Base64 et Photo_Name sont requis'
            });
            return;
        }
        const pool = (0, db_1.getPool)();
        // Vérifier si une photo existe déjà pour cet article
        const [existingPhotos] = await pool.execute('SELECT IDFOTO FROM fotos WHERE ARCLEUNIK = ?', [id]);
        if (Array.isArray(existingPhotos) && existingPhotos.length > 0) {
            // Mettre à jour la photo existante
            await pool.execute('UPDATE fotos SET Photo_Base64 = ?, Photo_Name = ?, Derniere_MAJ = NOW() WHERE ARCLEUNIK = ?', [Photo_Base64, Photo_Name, id]);
        }
        else {
            // Insérer une nouvelle photo
            await pool.execute('INSERT INTO fotos (ARCLEUNIK, Photo_Name, Photo_Base64, Derniere_MAJ) VALUES (?, ?, ?, NOW())', [id, Photo_Name, Photo_Base64]);
        }
        res.status(200).json({
            status: 'ok',
            message: 'Photo ajoutée avec succès'
        });
    }
    catch (error) {
        console.error('Error adding photo to article:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add photo to article'
        });
    }
};
exports.addPhotoToArticle = addPhotoToArticle;
