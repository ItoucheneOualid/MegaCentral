import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DatabaseService from "../services/databaseService";
import { getRequiredEnvVar } from "../config/env";
import { hashPassword, verifyPasswordHash } from "../utils/passwordHash";

const JWT_SECRET = getRequiredEnvVar("JWT_SECRET");

export class AuthController {
  static async isPasswordValid(storedPassword: unknown, inputPassword: string): Promise<boolean> {
    if (typeof inputPassword !== "string" || !inputPassword) {
      return false;
    }

    if (typeof storedPassword !== "string") {
      return false;
    }

    const normalizedStoredPassword = storedPassword.trim();

    if (!normalizedStoredPassword) {
      return false;
    }

    if (/^\$2[aby]\$/.test(normalizedStoredPassword)) {
      return bcrypt.compare(inputPassword, normalizedStoredPassword);
    }

    if (normalizedStoredPassword.startsWith("s1$")) {
      return verifyPasswordHash(inputPassword, normalizedStoredPassword);
    }

    return normalizedStoredPassword === inputPassword;
  }

  static async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({
          success: false,
          message: "Login et mot de passe requis",
        });
      }

      const query = `
        SELECT
          id,
          Login,
          Password,
          Nom,
          Prenom,
          Email,
          Voir_prix_Achat,
          Is_Admin,
          Derniere_Connexion_Time
        FROM Users
        WHERE Login = ?
        LIMIT 1
      `;

      const users = await DatabaseService.query(query, [login]);

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Login ou mot de passe incorrect",
        });
      }

      const user = users[0];
      const isPasswordValid = await AuthController.isPasswordValid(
        user.Password,
        password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Login ou mot de passe incorrect",
        });
      }

      if (
        typeof user.Password === "string" &&
        !user.Password.startsWith("s1$") &&
        !/^\$2[aby]\$/.test(user.Password)
      ) {
        await DatabaseService.query(
          "UPDATE Users SET Password = ?, Derniere_MAJ = CURDATE() WHERE id = ?",
          [await hashPassword(password), user.id]
        );
      }

      await DatabaseService.query(
        "UPDATE Users SET Derniere_Connexion_Time = NOW() WHERE id = ?",
        [user.id]
      );

      const role =
        user.Is_Admin === 1 || user.Is_Admin === "1"
          ? "admin"
          : "standard";

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
        { expiresIn: "24h" }
      );

      return res.json({
        success: true,
        message: "Connexion réussie",
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
      console.error("Erreur lors de la connexion :", error);

      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la connexion",
      });
    }
  }

  static async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token non fourni",
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      if (
        typeof decoded === "string" ||
        typeof decoded.userId !== "number"
      ) {
        return res.status(401).json({
          success: false,
          message: "Contenu du token invalide",
        });
      }

      const query = `
        SELECT
          id,
          Login,
          Nom,
          Prenom,
          Email,
          Voir_prix_Achat,
          Is_Admin
        FROM Users
        WHERE id = ?
        LIMIT 1
      `;

      const users = await DatabaseService.query(query, [decoded.userId]);

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      const user = users[0];

      const role =
        user.Is_Admin === 1 || user.Is_Admin === "1"
          ? "admin"
          : "standard";

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
      console.error("Erreur lors de la vérification du token :", error);

      return res.status(401).json({
        success: false,
        message: "Token invalide",
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const currentUser = req.user;

      if (!currentUser?.userId) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié",
        });
      }

      const query = `
        SELECT
          id,
          Login,
          Nom,
          Prenom,
          Email,
          Voir_prix_Achat,
          Is_Admin,
          Derniere_Connexion_Time
        FROM Users
        WHERE id = ?
        LIMIT 1
      `;

      const users = await DatabaseService.query(query, [
        currentUser.userId,
      ]);

      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur introuvable",
        });
      }

      const user = users[0];

      const role =
        user.Is_Admin === 1 || user.Is_Admin === "1"
          ? "admin"
          : "standard";

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
      console.error("Erreur getProfile :", error);

      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération du profil",
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const currentUser = req.user;
      const { nom, prenom, email } = req.body;

      if (!currentUser?.userId) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié",
        });
      }

      if (!nom || !prenom || !email) {
        return res.status(400).json({
          success: false,
          message: "Nom, prénom et email sont requis",
        });
      }

      await DatabaseService.query(
        `
          UPDATE Users
          SET Nom = ?, Prenom = ?, Email = ?
          WHERE id = ?
        `,
        [nom, prenom, email, currentUser.userId]
      );

      const users = await DatabaseService.query(
        `
          SELECT
            id,
            Login,
            Nom,
            Prenom,
            Email,
            Voir_prix_Achat,
            Is_Admin,
            Derniere_Connexion_Time
          FROM Users
          WHERE id = ?
          LIMIT 1
        `,
        [currentUser.userId]
      );

      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur introuvable",
        });
      }

      const user = users[0];

      const role =
        user.Is_Admin === 1 || user.Is_Admin === "1"
          ? "admin"
          : "standard";

      return res.json({
        success: true,
        message: "Profil mis à jour avec succès",
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
      console.error("Erreur updateProfile :", error);

      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la modification du profil",
      });
    }
  }

  static async logout(req: Request, res: Response) {
    return res.json({
      success: true,
      message: "Déconnexion réussie",
    });
  }

  static authenticateToken(
    req: Request,
    res: Response,
    next: Function
  ) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification requis",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (
        typeof decoded === "string" ||
        typeof decoded.userId !== "number" ||
        typeof decoded.login !== "string" ||
        typeof decoded.role !== "string"
      ) {
        return res.status(401).json({
          success: false,
          message: "Contenu du token invalide",
        });
      }

      req.user = {
        id: decoded.userId,
        userId: decoded.userId,
        login: decoded.login,
        role: decoded.role,
        nom: typeof decoded.nom === "string" ? decoded.nom : "",
        prenom:
          typeof decoded.prenom === "string" ? decoded.prenom : "",
        email: typeof decoded.email === "string" ? decoded.email : "",
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token invalide ou expiré",
      });
    }
  }

  static requireRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: Function) => {
      const user = req.user;

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Permissions insuffisantes",
        });
      }

      next();
    };
  }

  static requireAdmin(
    req: Request,
    res: Response,
    next: Function
  ) {
    const user = req.user;

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Accès réservé aux administrateurs",
      });
    }

    next();
  }

  static requireViewOnly(
    req: Request,
    res: Response,
    next: Function
  ) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    (req as Request & { isViewOnly?: boolean }).isViewOnly =
      user.role === "standard";

    next();
  }
}