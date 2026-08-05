import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { AuthController } from '../controllers/authController';
import { sendPasswordResetEmail } from '../controllers/emailController';
import { DatabaseService } from '../services/databaseService';

const router = Router();

const FRONTEND_URL = (
  process.env.FRONTEND_URL || 'http://localhost:3001'
).replace(/\/+$/, '');

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
      SELECT id, Login, Nom, Prenom, Email
      FROM users
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

    /*
     * Le token envoyé par email reste secret.
     * Seul son hash SHA-256 est enregistré dans la base.
     */
    const resetToken = crypto.randomBytes(32).toString('hex');

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expirationDate = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await DatabaseService.update(
      `
      UPDATE users
      SET reset_token = ?,
          reset_token_expires = ?
      WHERE id = ?
      `,
      [resetTokenHash, expirationDate, user.id]
    );

    const resetLink =
      `${FRONTEND_URL}/reset-password` +
      `?token=${encodeURIComponent(resetToken)}`;

    try {
      await sendPasswordResetEmail(
        user.Email,
        resetLink,
        user.Prenom
      );
    } catch (emailError) {
      /*
       * Supprimer le token si l'envoi échoue.
       */
      await DatabaseService.update(
        `
        UPDATE users
        SET reset_token = NULL,
            reset_token_expires = NULL
        WHERE id = ?
        `,
        [user.id]
      );

      throw emailError;
    }

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

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const rows = await DatabaseService.query(
      `
      SELECT id
      FROM users
      WHERE reset_token = ?
        AND reset_token_expires IS NOT NULL
        AND reset_token_expires > NOW()
      LIMIT 1
      `,
      [resetTokenHash]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lien invalide, expiré ou déjà utilisé',
      });
    }

    const user = rows[0] as { id: number };

    const hashedPassword = await bcrypt.hash(password, 12);

    await DatabaseService.update(
      `
      UPDATE users
      SET Password = ?,
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = ?
        AND reset_token = ?
      `,
      [hashedPassword, user.id, resetTokenHash]
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