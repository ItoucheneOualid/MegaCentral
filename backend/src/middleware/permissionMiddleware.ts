import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  Permission,
  ROLE_PERMISSIONS,
  PERMISSION_MESSAGES,
} from "../types/permissions";
import { getRequiredEnvVar } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        userId: number;
        login: string;
        role: string;
        nom: string;
        prenom: string;
        email: string;
      };
    }
  }
}

const JWT_SECRET = getRequiredEnvVar("JWT_SECRET");

/**
 * Vérifie si l'utilisateur est authentifié.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token manquant. Veuillez vous connecter.",
      code: "TOKEN_MISSING",
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
        message: "Contenu du token invalide. Veuillez vous reconnecter.",
        code: "TOKEN_PAYLOAD_INVALID",
      });
    }

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      login: decoded.login,
      role: decoded.role,
      nom: typeof decoded.nom === "string" ? decoded.nom : "",
      prenom: typeof decoded.prenom === "string" ? decoded.prenom : "",
      email: typeof decoded.email === "string" ? decoded.email : "",
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré. Veuillez vous reconnecter.",
      code: "TOKEN_INVALID",
    });
  }
};

/**
 * Vérifie si l'utilisateur possède une permission précise.
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié.",
        code: "USER_NOT_AUTHENTICATED",
      });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    if (!userPermissions.includes(permission)) {
      const message =
        PERMISSION_MESSAGES[permission] || "🚫 Action non autorisée";

      return res.status(403).json({
        success: false,
        message,
        code: "PERMISSION_DENIED",
        required_permission: permission,
        user_role: req.user.role,
        user_permissions: userPermissions,
      });
    }

    next();
  };
};

/**
 * Vérifie si l'utilisateur est administrateur.
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Utilisateur non authentifié.",
      code: "USER_NOT_AUTHENTICATED",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message:
        "🚫 Accès administrateur requis\n\nCette fonctionnalité est réservée aux administrateurs.\n\nContactez votre administrateur si vous pensez avoir besoin de cet accès.",
      code: "ADMIN_REQUIRED",
      user_role: req.user.role,
    });
  }

  next();
};

/**
 * Vérifie si l'utilisateur possède un accès en lecture.
 */
export const requireReadAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Utilisateur non authentifié.",
      code: "USER_NOT_AUTHENTICATED",
    });
  }

  next();
};