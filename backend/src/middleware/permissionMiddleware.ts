import { Request, Response, NextFunction } from 'express';
import { Permission, ROLE_PERMISSIONS, PERMISSION_MESSAGES } from '../types/permissions';

// Interface pour étendre Request avec user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        login: string;
        role: string;
        nom: string;
        prenom: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Token manquant. Veuillez vous connecter.',
      code: 'TOKEN_MISSING'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-j tres-securise';
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Token invalide ou expiré. Veuillez vous reconnecter.',
      code: 'TOKEN_INVALID'
    });
  }
};

/**
 * Middleware pour vérifier une permission spécifique
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Vérifier d'abord si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Utilisateur non authentifié.',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    // Récupérer les permissions de l'utilisateur
    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    
    // Vérifier si l'utilisateur a la permission requise
    if (!userPermissions.includes(permission)) {
      const message = PERMISSION_MESSAGES[permission] || '🚫 Action non autorisée';
      
      return res.status(403).json({ 
        success: false,
        message: message,
        code: 'PERMISSION_DENIED',
        required_permission: permission,
        user_role: req.user.role,
        user_permissions: userPermissions
      });
    }

    // Si l'utilisateur a la permission, continuer
    next();
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Utilisateur non authentifié.',
      code: 'USER_NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: '🚫 Accès administrateur requis\n\nCette fonctionnalité est réservée aux administrateurs.\n\nContactez votre administrateur si vous pensez avoir besoin de cet accès.',
      code: 'ADMIN_REQUIRED',
      user_role: req.user.role
    });
  }

  next();
};

/**
 * Middleware pour vérifier si l'utilisateur a des permissions de lecture
 */
export const requireReadAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Utilisateur non authentifié.',
      code: 'USER_NOT_AUTHENTICATED'
    });
  }

  // Les utilisateurs standards et admins peuvent tous lire
  next();
};
