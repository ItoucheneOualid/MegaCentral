import { Router } from 'express';
import crypto from 'crypto';

import { AuthController } from '../controllers/authController';
import { sendPasswordResetEmail } from '../controllers/emailController';
import { DatabaseService } from '../services/databaseService';

const router = Router();

router.post('/login', AuthController.login);

router.get(
  '/verify',
  AuthController.authenticateToken,
  AuthController.verifyToken
);

router.get(
  '/profile',
  AuthController.authenticateToken,
  AuthController.getProfile
);

router.put(
  '/profile',
  AuthController.authenticateToken,
  AuthController.updateProfile
);

router.post('/logout', AuthController.logout);

router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email ou login requis',
      });
    }

    const rows = await DatabaseService.query(
      `
      SELECT id, Login, Nom, Prenom, Email
      FROM users
      WHERE Email = ? OR Login = ?
      LIMIT 1
      `,
      [identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        message: 'Si le compte existe, un email a été envoyé.',
      });
    }

    const user = rows[0] as any;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await DatabaseService.update(
      `
      UPDATE users
      SET reset_token = ?, reset_token_expires = ?
      WHERE id = ?
      `,
      [token, expires, user.id]
    );

    const resetLink = `http://localhost:3001/reset-password?token=${token}`;

    await sendPasswordResetEmail(
      user.Email,
      resetLink,
      user.Prenom
    );

    return res.json({
      success: true,
      message: 'Un email de récupération a été envoyé.',
    });
  } catch (error) {
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

    const rows = await DatabaseService.query(
      `
      SELECT id
      FROM users
      WHERE reset_token = ?
      LIMIT 1
      `,
      [token]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lien invalide ou expiré',
      });
    }

    const user = rows[0] as any;

    await DatabaseService.update(
      `
      UPDATE users
      SET Password = ?,
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = ?
      `,
      [password, user.id]
    );

    return res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    console.error('Erreur reset-password:', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur reset password',
    });
  }
});

export default router;