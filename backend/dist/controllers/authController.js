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
    // Connexion utilisateur
    static async login(req, res) {
        try {
            const { login, password } = req.body;
            console.log('🔍 Login attempt:', { login, passwordLength: password?.length });
            if (!login || !password) {
                console.log('❌ Missing credentials');
                return res.status(400).json({
                    success: false,
                    message: 'Login et mot de passe requis'
                });
            }
            // Récupérer l'utilisateur depuis la base de données
            const query = `
        SELECT id, Login, Password, Nom, Prenom, Email, Voir_prix_Achat, Is_Admin, Derniere_Connexion_Time
        FROM users 
        WHERE Login = ?
      `;
            console.log('🔍 Recherche utilisateur:', login);
            console.log('🔍 Query:', query);
            const users = await databaseService_1.default.query(query, [login]);
            console.log('🔍 Utilisateurs trouvés:', users.length);
            if (users.length > 0) {
                console.log('🔍 Utilisateur:', users[0].Login, 'Password length:', users[0].Password?.length || 0);
            }
            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Login ou mot de passe incorrect'
                });
            }
            const user = users[0];
            // Vérifier le mot de passe (si hashé ou en clair)
            let isPasswordValid = false;
            console.log('🔍 Password fourni:', password);
            console.log('🔍 Password DB:', user.Password);
            console.log('🔍 Password DB length:', user.Password.length);
            // Vérifier si le mot de passe est hashé (commence par $2b$)
            if (user.Password.startsWith('$2b$')) {
                console.log('🔍 Password hashé détecté - test bcrypt...');
                try {
                    isPasswordValid = await bcryptjs_1.default.compare(password, user.Password);
                    console.log('🔍 bcrypt result:', isPasswordValid);
                }
                catch (error) {
                    console.log('🔍 bcrypt failed:', error);
                    isPasswordValid = false;
                }
            }
            else {
                console.log('🔍 Password en clair détecté - comparaison directe...');
                isPasswordValid = password === user.Password;
                console.log('🔍 plaintext result:', isPasswordValid);
            }
            console.log('🔍 Final password valid:', isPasswordValid);
            if (!isPasswordValid) {
                console.log('❌ Password validation failed');
                return res.status(401).json({
                    success: false,
                    message: 'Login ou mot de passe incorrect'
                });
            }
            console.log('✅ Password validation successful');
            // Mettre à jour la dernière connexion
            await databaseService_1.default.query('UPDATE users SET Derniere_Connexion_Time = NOW() WHERE id = ?', [user.id]);
            // Déterminer le rôle
            const role = user.Is_Admin === '1' ? 'admin' : 'standard';
            // Créer le token JWT
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                login: user.Login,
                role: role,
                nom: user.Nom,
                prenom: user.Prenom,
                email: user.Email,
                voirPrixAchat: user.Voir_prix_Achat
            }, JWT_SECRET, { expiresIn: '24h' });
            // Retourner les infos utilisateur (sans le mot de passe)
            res.json({
                success: true,
                message: 'Connexion réussie',
                token,
                user: {
                    id: user.id,
                    login: user.Login,
                    nom: user.Nom,
                    prenom: user.Prenom,
                    email: user.Email,
                    role: role,
                    voirPrixAchat: user.Voir_prix_Achat
                }
            });
        }
        catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la connexion'
            });
        }
    }
    // Vérification du token
    static async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token non fourni'
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Rafraîchir les infos utilisateur
            const query = `
        SELECT id, Login, Nom, Prenom, Email, Voir_prix_Achat, Is_Admin
        FROM users 
        WHERE id = ?
      `;
            const users = await databaseService_1.default.query(query, [decoded.userId]);
            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }
            const user = users[0];
            const role = user.Is_Admin === 1 ? 'admin' : 'standard';
            res.json({
                success: true,
                user: {
                    id: user.id,
                    login: user.Login,
                    nom: user.Nom,
                    prenom: user.Prenom,
                    email: user.Email,
                    role: role,
                    voirPrixAchat: user.Voir_prix_Achat
                }
            });
        }
        catch (error) {
            console.error('Erreur lors de la vérification du token:', error);
            res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
    }
    // Déconnexion
    static async logout(req, res) {
        try {
            // Dans une implémentation plus avancée, on pourrait ajouter le token à une liste noire
            res.json({
                success: true,
                message: 'Déconnexion réussie'
            });
        }
        catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la déconnexion'
            });
        }
    }
    // Middleware de vérification d'authentification
    static authenticateToken(req, res, next) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification requis'
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token invalide ou expiré'
            });
        }
    }
    // Middleware de vérification des rôles
    static requireRole(allowedRoles) {
        return (req, res, next) => {
            const user = req.user;
            if (!user || !allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Permissions insuffisantes'
                });
            }
            next();
        };
    }
    // Middleware pour vérifier les droits d'admin
    static requireAdmin(req, res, next) {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès réservé aux administrateurs'
            });
        }
        next();
    }
    // Middleware pour vérifier les droits de consultation uniquement
    static requireViewOnly(req, res, next) {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }
        // Les utilisateurs standards peuvent consulter mais pas modifier
        req.isViewOnly = user.role === 'standard';
        next();
    }
}
exports.AuthController = AuthController;
