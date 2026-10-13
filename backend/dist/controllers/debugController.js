"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugController = void 0;
const databaseService_1 = require("../services/databaseService");
const passwordHash_1 = require("../utils/passwordHash");
class DebugController {
    // Lister toutes les tables
    static async listTables(req, res) {
        try {
            const query = 'SHOW TABLES';
            const tables = await databaseService_1.DatabaseService.query(query);
            res.json({
                success: true,
                data: tables,
                count: tables.length
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des tables'
            });
        }
    }
    // Afficher tous les utilisateurs
    static async getUsers(req, res) {
        try {
            const users = await databaseService_1.DatabaseService.query('SELECT id, Login, Nom, Prenom, Email, Is_Admin FROM Users');
            res.json({
                success: true,
                users: users
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des utilisateurs'
            });
        }
    }
    // Supprimer un utilisateur
    static async deleteUser(req, res) {
        try {
            const { login } = req.body;
            const deleteQuery = 'DELETE FROM Users WHERE Login = ?';
            await databaseService_1.DatabaseService.query(deleteQuery, [login]);
            res.json({
                success: true,
                message: `Utilisateur ${login} supprimé`
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de l\'utilisateur'
            });
        }
    }
    // Tester bcrypt hashing
    static async testBcrypt(req, res) {
        try {
            const { password } = req.body;
            const bcrypt = require('bcryptjs');
            // Créer un hash
            const hash = await bcrypt.hash(password, 10);
            // Tester la comparaison
            const isValid = await bcrypt.compare(password, hash);
            res.json({
                success: true,
                password: password,
                hash: hash,
                isValid: isValid,
                message: `Hash: ${hash}, Valid: ${isValid}`
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du test bcrypt'
            });
        }
    }
    // Vérifier un utilisateur spécifique
    static async checkUser(req, res) {
        try {
            const { login } = req.body;
            const query = `
        SELECT id, Login, Nom, Prenom, Email, Is_Admin
        FROM Users
        WHERE Login = ?
      `;
            const users = await databaseService_1.DatabaseService.query(query, [login]);
            if (users.length === 0) {
                return res.json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }
            const user = users[0];
            res.json({
                success: true,
                user: {
                    id: user.id,
                    Login: user.Login,
                    Nom: user.Nom,
                    Prenom: user.Prenom,
                    Email: user.Email,
                    Is_Admin: user.Is_Admin
                }
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la vérification de l\'utilisateur'
            });
        }
    }
    // Mettre à jour le mot de passe d'un utilisateur
    static async updateUserPassword(req, res) {
        try {
            const { login, password } = req.body;
            const hashedPassword = await (0, passwordHash_1.hashPassword)(password);
            const updateQuery = `
        UPDATE Users SET Password = ?, Derniere_MAJ = CURDATE()
        WHERE Login = ?
      `;
            await databaseService_1.DatabaseService.query(updateQuery, [hashedPassword, login]);
            res.json({
                success: true,
                message: 'Mot de passe mis à jour avec succès'
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour du mot de passe'
            });
        }
    }
    // Créer un utilisateur de test
    static async createTestUser(req, res) {
        try {
            const { login, password, nom, prenom, email, is_admin } = req.body;
            const hashedPassword = await (0, passwordHash_1.hashPassword)(password);
            const insertQuery = `
        INSERT INTO Users (Login, Password, Nom, Prenom, Email, Is_Admin, Derniere_MAJ)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
            await databaseService_1.DatabaseService.query(insertQuery, [login, hashedPassword, nom, prenom, email, is_admin]);
            res.json({
                success: true,
                message: 'Utilisateur créé avec succès (mot de passe haché)'
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de l\'utilisateur'
            });
        }
    }
    // Afficher la structure de la table users
    static async getUsersTableStructure(req, res) {
        try {
            const structure = await databaseService_1.DatabaseService.query('DESCRIBE Users');
            res.json({
                success: true,
                structure: structure
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de la structure'
            });
        }
    }
    // Tester une table spécifique
    static async testTable(req, res) {
        try {
            const { tableName } = req.params;
            // Vérifier si la table existe
            const checkQuery = `SHOW TABLES LIKE '${tableName}'`;
            const [result] = await databaseService_1.DatabaseService.query(checkQuery);
            if (result.length === 0) {
                return res.json({
                    success: false,
                    error: `La table '${tableName}' n'existe pas`,
                    suggestion: 'Vérifiez le nom exact de votre table fournisseurs'
                });
            }
            // Afficher la structure
            const structureQuery = `DESCRIBE ${tableName}`;
            const [structure] = await databaseService_1.DatabaseService.query(structureQuery);
            // Afficher quelques données
            const dataQuery = `SELECT * FROM ${tableName} LIMIT 3`;
            const [data] = await databaseService_1.DatabaseService.query(dataQuery);
            res.json({
                success: true,
                table: tableName,
                structure: structure,
                sampleData: data,
                totalRows: data.length
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du test de la table'
            });
        }
    }
}
exports.DebugController = DebugController;
