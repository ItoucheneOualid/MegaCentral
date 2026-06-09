"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
// Configuration de connexion à la base de données MySQL existante
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Walid@19960', // Même mot de passe que db.ts
    database: 'idmegacentral', // Base de données correcte (avec le i)
    charset: 'utf8mb4',
    timezone: '+00:00',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};
// Créer le pool de connexions
const pool = promise_1.default.createPool(dbConfig);
class DatabaseService {
    // Tester la connexion au démarrage
    static async initializeConnection() {
        try {
            console.log('Tentative de connexion à la base de données...');
            console.log('Configuration:', {
                host: dbConfig.host,
                user: dbConfig.user,
                database: dbConfig.database
            });
            const connection = await pool.getConnection();
            await connection.ping();
            console.log('✅ Connexion à la base de données réussie !');
            connection.release();
            return true;
        }
        catch (error) {
            console.error('❌ Erreur de connexion à la base de données:', error);
            console.error('Vérifiez:');
            console.error('1. Que MySQL/WAMP est bien démarré');
            console.error('2. Que la base de données "idmegacentral" existe');
            console.error('3. Que l\'utilisateur "root" a les bons droits');
            console.error('4. Que le mot de passe MySQL est correct');
            return false;
        }
    }
    // Exécuter une requête SQL
    static async query(sql, params) {
        try {
            const [rows] = await pool.query(sql, params ?? []);
            return rows;
        }
        catch (error) {
            console.error('❌ Erreur SQL:', error);
            console.error('Requête:', sql);
            console.error('Paramètres:', params);
            throw error;
        }
    }
    // Exécuter une requête d'insertion
    static async insert(sql, params) {
        try {
            const [result] = await pool.execute(sql, params ?? []);
            return result;
        }
        catch (error) {
            console.error('Erreur SQL:', error);
            throw error;
        }
    }
    // Exécuter une requête de mise à jour
    static async update(sql, params) {
        try {
            const [result] = await pool.execute(sql, params ?? []);
            return result;
        }
        catch (error) {
            console.error('Erreur SQL:', error);
            throw error;
        }
    }
    // Exécuter une requête de suppression
    static async delete(sql, params) {
        try {
            const [result] = await pool.execute(sql, params ?? []);
            return result;
        }
        catch (error) {
            console.error('Erreur SQL:', error);
            throw error;
        }
    }
    // Tester la connexion
    static async testConnection() {
        try {
            const connection = await pool.getConnection();
            await connection.ping();
            connection.release();
            return true;
        }
        catch (error) {
            console.error('Erreur de connexion à la base de données:', error);
            return false;
        }
    }
    // Fermer le pool de connexions
    static async closePool() {
        try {
            await pool.end();
        }
        catch (error) {
            console.error('Erreur lors de la fermeture du pool:', error);
        }
    }
}
exports.DatabaseService = DatabaseService;
exports.default = DatabaseService;
