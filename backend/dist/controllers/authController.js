"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const databaseService_1 = __importDefault(require("../services/databaseService"));
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-j tres-securise';
class AuthController {
    static async login(req, res) {
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
            const users = await databaseService_1.default.query(query, [login]);
            if (!users || users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Login ou mot de passe incorrect',
                });
            }
            const user = users[0];
            let isPasswordValid = false;
            if (user.Password?.startsWith('$2b$')) {
                isPasswordValid = await bcryptjs_1.default.compare(password, user.Password);
            }
            else {
                isPasswordValid = password === user.Password;
            }
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Login ou mot de passe incorrect',
                });
            }
            await databaseService_1.default.query('UPDATE users SET Derniere_Connexion_Time = NOW() WHERE id = ?', [user.id]);
            const role = user.Is_Admin === 1 || user.Is_Admin === '1' ? 'admin' : 'standard';
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                login: user.Login,
                role,
                nom: user.Nom,
                prenom: user.Prenom,
                email: user.Email,
                voirPrixAchat: user.Voir_prix_Achat,
            }, JWT_SECRET, { expiresIn: '24h' });
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
        }
        catch (error) {
            console.error('Erreur lors de la connexion:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la connexion',
            });
        }
    }
    static async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token non fourni',
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const query = `
        SELECT id, Login, Nom, Prenom, Email, Voir_prix_Achat, Is_Admin
        FROM users
        WHERE id = ?
        LIMIT 1
      `;
            const users = await databaseService_1.default.query(query, [decoded.userId]);
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
        }
        catch (error) {
            console.error('Erreur lors de la vérification du token:', error);
            return res.status(401).json({
                success: false,
                message: 'Token invalide',
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const currentUser = req.user;
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
            const users = await databaseService_1.default.query(query, [currentUser.userId]);
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
        }
        catch (error) {
            console.error('Erreur getProfile:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la récupération du profil',
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            const currentUser = req.user;
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
            await databaseService_1.default.query(`
        UPDATE users
        SET Nom = ?, Prenom = ?, Email = ?
        WHERE id = ?
        `, [nom, prenom, email, currentUser.userId]);
            const users = await databaseService_1.default.query(`
        SELECT id, Login, Nom, Prenom, Email, Voir_prix_Achat, Is_Admin, Derniere_Connexion_Time
        FROM users
        WHERE id = ?
        LIMIT 1
        `, [currentUser.userId]);
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
        }
        catch (error) {
            console.error('Erreur updateProfile:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la modification du profil',
            });
        }
    }
    static async logout(req, res) {
        return res.json({
            success: true,
            message: 'Déconnexion réussie',
        });
    }
    static authenticateToken(req, res, next) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token d'authentification requis",
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou expiré',
            });
        }
    }
    static requireRole(allowedRoles) {
        return (req, res, next) => {
            const user = req.user;
            if (!user || !allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Permissions insuffisantes',
                });
            }
            next();
        };
    }
    static requireAdmin(req, res, next) {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès réservé aux administrateurs',
            });
        }
        next();
    }
    static requireViewOnly(req, res, next) {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise',
            });
        }
        req.isViewOnly = user.role === 'standard';
        next();
    }
}
exports.AuthController = AuthController;
