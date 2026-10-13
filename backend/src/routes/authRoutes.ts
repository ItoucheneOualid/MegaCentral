import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { AuthController } from '../controllers/authController';
import { sendPasswordResetEmail } from '../controllers/emailController';
import { DatabaseService } from '../services/databaseService';
import { getRequiredEnvVar } from '../config/env';
import { hashPassword } from '../utils/passwordHash';

const router = Router();

const FRONTEND_URL = (
  process.env.FRONTEND_URL || 'http://localhost:3001'
).replace(/\/+$/, '');
const JWT_SECRET = getRequiredEnvVar('JWT_SECRET');

const GENERIC_RESET_MESSAGE =
  'Si ce compte existe, un email de récupération a été envoyé.';

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

/**
 * Demande de récupération du mot de passe.
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const identifier =
      typeof req.body?.identifier === 'string'
        ? req.body.identifier.trim()
        : '';

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email ou login requis',
      });
    }

    const rows = await DatabaseService.query(
      `
      SELECT id, Login, Nom, Prenom, Email, Password
      FROM Users
      WHERE Email = ? OR Login = ?
      LIMIT 1
      `,
      [identifier, identifier]
    );

    /*
     * Toujours retourner le même message afin de ne pas révéler
     * si un compte existe ou non.
     */
    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        message: GENERIC_RESET_MESSAGE,
      });
    }

    const user = rows[0] as {
      id: number;
      Login: string;
      Nom?: string;
      Prenom?: string;
      Email?: string;
      Password: string;
    };

    if (!user.Email || !user.Email.includes('@')) {
      console.error(
        `Aucune adresse email valide pour l'utilisateur ${user.Login}`
      );

      return res.json({
        success: true,
        message: GENERIC_RESET_MESSAGE,
      });
    }

    const passwordFingerprint = crypto
      .createHash('sha256')
      .update(String(user.Password || ''))
      .digest('hex');
    const resetToken = jwt.sign(
      { purpose: 'password-reset', userId: user.id, passwordFingerprint },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink =
      `${FRONTEND_URL}/reset-password` +
      `?token=${encodeURIComponent(resetToken)}`;

    await sendPasswordResetEmail(user.Email, resetLink, user.Prenom);

    return res.json({
      success: true,
      message: GENERIC_RESET_MESSAGE,
    });
  } catch (error) {
    console.error('Erreur forgot-password:', error);

    return res.status(500).json({
      success: false,
      message:
        'Le service de récupération est temporairement indisponible.',
    });
  }
});

/**
 * Enregistrement du nouveau mot de passe.
 */
router.post('/reset-password', async (req, res) => {
  try {
    const token =
      typeof req.body?.token === 'string'
        ? req.body.token.trim()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lien et nouveau mot de passe requis',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          'Le nouveau mot de passe doit contenir au moins 8 caractères.',
      });
    }

    let decoded: jwt.JwtPayload;
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (
        typeof payload === 'string' ||
        payload.purpose !== 'password-reset' ||
        typeof payload.userId !== 'number' ||
        typeof payload.passwordFingerprint !== 'string'
      ) {
        throw new Error('Invalid reset token payload');
      }
      decoded = payload;
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Lien invalide, expiré ou déjà utilisé',
      });
    }

    const rows = await DatabaseService.query(
      'SELECT id, Password FROM Users WHERE id = ? LIMIT 1',
      [decoded.userId]
    );
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lien invalide, expiré ou déjà utilisé',
      });
    }

    const user = rows[0] as { id: number; Password: string };
    const currentFingerprint = crypto
      .createHash('sha256')
      .update(String(user.Password || ''))
      .digest('hex');
    if (currentFingerprint !== decoded.passwordFingerprint) {
      return res.status(400).json({
        success: false,
        message: 'Lien invalide, expiré ou déjà utilisé',
      });
    }

    const hashedPassword = await hashPassword(password);

    await DatabaseService.update(
      `
      UPDATE Users
      SET Password = ?,
          Derniere_MAJ = CURDATE()
      WHERE id = ?
      `,
      [hashedPassword, user.id]
    );

    return res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    console.error('Erreur reset-password:', error);

    return res.status(500).json({
      success: false,
      message:
        'Erreur serveur lors de la modification du mot de passe',
    });
  }
});

export default router;