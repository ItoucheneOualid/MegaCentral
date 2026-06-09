"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const authController_1 = require("../controllers/authController");
const emailController_1 = require("../controllers/emailController");
const databaseService_1 = require("../services/databaseService");
const router = (0, express_1.Router)();
router.post('/login', authController_1.AuthController.login);
router.get('/verify', authController_1.AuthController.authenticateToken, authController_1.AuthController.verifyToken);
router.post('/logout', authController_1.AuthController.logout);
router.post('/forgot-password', async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: 'Email ou login requis',
            });
        }
        const rows = await databaseService_1.DatabaseService.query(`
      SELECT id, Login, Nom, Prenom, Email
      FROM users
      WHERE Email = ? OR Login = ?
      LIMIT 1
      `, [identifier, identifier]);
        if (!rows || rows.length === 0) {
            return res.json({
                success: true,
                message: 'Si le compte existe, un email a été envoyé.',
            });
        }
        const user = rows[0];
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await databaseService_1.DatabaseService.update(`
      UPDATE users
      SET reset_token = ?, reset_token_expires = ?
      WHERE id = ?
      `, [token, expires, user.id]);
        const resetLink = `http://localhost:3001/reset-password?token=${token}`;
        await (0, emailController_1.sendPasswordResetEmail)(user.Email, resetLink, user.Prenom);
        return res.json({
            success: true,
            message: 'Un email de récupération a été envoyé.',
        });
    }
    catch (error) {
        console.error('Erreur forgot-password:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur récupération mot de passe',
        });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token et nouveau mot de passe requis',
            });
        }
        const rows = await databaseService_1.DatabaseService.query(`
      SELECT id
      FROM users
      WHERE reset_token = ?
      
      LIMIT 1
      `, [token]);
        if (!rows || rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lien invalide ou expiré',
            });
        }
        const user = rows[0];
        await databaseService_1.DatabaseService.update(`
      UPDATE users
      SET Password = ?,
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = ?
      `, [password, user.id]);
        return res.json({
            success: true,
            message: 'Mot de passe modifié avec succès',
        });
    }
    catch (error) {
        console.error('Erreur reset-password:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur reset password',
        });
    }
});
exports.default = router;
