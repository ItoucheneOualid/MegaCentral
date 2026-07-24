import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import DatabaseService from '../services/databaseService';
import { getRequiredEnvVar } from '../config/env';

const JWT_SECRET = getRequiredEnvVar('JWT_SECRET');

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({
          success: false,
          message: 'Login et mot de passe requis',
        });
      }

      const query = `
        SELECT id, Login, Password, Nom, Prenom, Email, Voir_prix_Achat, Is_Admin, Derniere_Connexion_Time
        FROM users
        WHERE Login = ?
        LIMIT 1
      `;

      const users = await DatabaseService.query(query, [login]);

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Login ou mot de passe incorrect',
        });
      }

      const user = users[0];
      let isPasswordValid = false;

      if (user.Password?.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(password, user.Password);
      } else {
        isPasswordValid = password === user.Password;
      }

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Login ou mot de passe incorrect',
        });
      }

      await DatabaseService.query(
        'UPDATE users SET Derniere_Connexion_Time = NOW() WHERE id = ?',
        [user.id]
      );

      const role = user.Is_Admin === 1 || user.Is_Admin === '1' ? 'admin' : 'standard';

      const token = jwt.sign(
        {
          userId: user.id,
          login: user.Login,
          role,
          nom: user.Nom,
          prenom: user.Prenom,
          email: user.Email,
          voirPrixAchat: user.Voir_prix_Achat,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          login: user.Login,
          nom: user.Nom,
          prenom: user.Prenom,
          email: user.Email,
          role,
          voirPrixAchat: user.Voir_prix_Achat,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la connexion',
      });
    }
  }

  static async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token non fourni',
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const query = `
        SELECT id, Login, Nom, Prenom, Email, Voir_prix_Achat, Is_Admin
        FROM users
        WHERE id = ?
        LIMIT 1
      `;

      const users = await DatabaseService.query(query, [decoded.userId]);

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      const user = users[0];
      const role = user.Is_Admin === 1 || user.Is_Admin === '1' ? 'admin' : 'standard';

      return res.json({
        success: true,
        user: {
          id: user.id,
          login: user.Login,
          nom: user.Nom,
          prenom: user.Prenom,
          email: user.Email,
          role,
          voirPrixAchat: user.Voir_prix_Achat,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;

      if (!currentUser?.userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
      }

      const query = `
        SELECT id, Login, Nom, Prenom, Email, Voir_prix_Achat, Is_Admin, Derniere_Connexion_Time
        FROM users
        WHERE id = ?
        LIMIT 1
      `;

      const users = await DatabaseService.query(query, [currentUser.userId]);

      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur introuvable',
        });
      }

      const user = users[0];
      const role = user.Is_Admin === 1 || user.Is_Admin === '1' ? 'admin' : 'standard';

      return res.json({
        success: true,
        data: {
          id: user.id,
          login: user.Login,
          nom: user.Nom,
          prenom: user.Prenom,
          email: user.Email,
          role,
          voirPrixAchat: user.Voir_prix_Achat,
          derniereConnexion: user.Derniere_Connexion_Time,
        },
      });
    } catch (error) {
      console.error('Erreur getProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du profil',
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { nom, prenom, email } = req.body;

      if (!currentUser?.userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
      }

      if (!nom || !prenom || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nom, prénom et email sont requis',
        });
      }

      await DatabaseService.query(
        `
        UPDATE users
        SET Nom = ?, Prenom = ?, Email = ?
        WHERE id = ?
        `,
        [nom, prenom, email, currentUser.userId]
      );

      const users = await DatabaseService.query(
        `
        SELECT id, Login, Nom, Prenom, Email, Voir_prix_Achat, Is_Admin, Derniere_Connexion_Time
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [currentUser.userId]
      );

      const user = users[0];
      const role = user.Is_Admin === 1 || user.Is_Admin === '1' ? 'admin' : 'standard';

      return res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: {
          id: user.id,
          login: user.Login,
          nom: user.Nom,
          prenom: user.Prenom,
          email: user.Email,
          role,
          voirPrixAchat: user.Voir_prix_Achat,
          derniereConnexion: user.Derniere_Connexion_Time,
        },
      });
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la modification du profil',
      });
    }
  }

  static async logout(req: Request, res: Response) {
    return res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  }

  static authenticateToken(req: Request, res: Response, next: Function) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification requis",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }
  }

  static requireRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: Function) => {
      const user = (req as any).user;

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes',
        });
      }

      next();
    };
  }

  static requireAdmin(req: Request, res: Response, next: Function) {
    const user = (req as any).user;

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs',
      });
    }

    next();
  }

  static requireViewOnly(req: Request, res: Response, next: Function) {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
    }

    (req as any).isViewOnly = user.role === 'standard';
    next();
  }
}