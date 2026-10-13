"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireReadAccess = exports.requireAdmin = exports.requirePermission = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const permissions_1 = require("../types/permissions");
const env_1 = require("../config/env");
const JWT_SECRET = (0, env_1.getRequiredEnvVar)("JWT_SECRET");
/**
 * Vérifie si l'utilisateur est authentifié.
 */
const authenticateToken = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded === "string" ||
            typeof decoded.userId !== "number" ||
            typeof decoded.login !== "string" ||
            typeof decoded.role !== "string") {
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
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token invalide ou expiré. Veuillez vous reconnecter.",
            code: "TOKEN_INVALID",
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Vérifie si l'utilisateur possède une permission précise.
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Utilisateur non authentifié.",
                code: "USER_NOT_AUTHENTICATED",
            });
        }
        const userPermissions = permissions_1.ROLE_PERMISSIONS[req.user.role] || [];
        if (!userPermissions.includes(permission)) {
            const message = permissions_1.PERMISSION_MESSAGES[permission] || "🚫 Action non autorisée";
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
exports.requirePermission = requirePermission;
/**
 * Vérifie si l'utilisateur est administrateur.
 */
const requireAdmin = (req, res, next) => {
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
            message: "🚫 Accès administrateur requis\n\nCette fonctionnalité est réservée aux administrateurs.\n\nContactez votre administrateur si vous pensez avoir besoin de cet accès.",
            code: "ADMIN_REQUIRED",
            user_role: req.user.role,
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Vérifie si l'utilisateur possède un accès en lecture.
 */
const requireReadAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Utilisateur non authentifié.",
            code: "USER_NOT_AUTHENTICATED",
        });
    }
    next();
};
exports.requireReadAccess = requireReadAccess;
