"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const db_1 = require("../config/db");
class DatabaseService {
    /**
     * Tester la connexion au démarrage.
     */
    static async initializeConnection() {
        let connection;
        try {
            console.log("Tentative de connexion à la base de données...");
            connection = await (0, db_1.getPool)().getConnection();
            await connection.ping();
            console.log("✅ Connexion sécurisée à la base de données réussie !");
            return true;
        }
        catch (error) {
            console.error("❌ Erreur de connexion à la base de données :", error);
            return false;
        }
        finally {
            if (connection) {
                connection.release();
            }
        }
    }
    /**
     * Exécuter une requête SQL.
     */
    static async query(sql, params = []) {
        try {
            const [rows] = await (0, db_1.getPool)().query(sql, params);
            return rows;
        }
        catch (error) {
            console.error("❌ Erreur SQL :", error);
            console.error("Requête :", sql);
            throw error;
        }
    }
    /**
     * Exécuter une requête d’insertion.
     */
    static async insert(sql, params = []) {
        try {
            const [result] = await (0, db_1.getPool)().execute(sql, params);
            return result;
        }
        catch (error) {
            console.error("❌ Erreur SQL lors de l’insertion :", error);
            throw error;
        }
    }
    /**
     * Exécuter une requête de mise à jour.
     */
    static async update(sql, params = []) {
        try {
            const [result] = await (0, db_1.getPool)().execute(sql, params);
            return result;
        }
        catch (error) {
            console.error("❌ Erreur SQL lors de la mise à jour :", error);
            throw error;
        }
    }
    /**
     * Exécuter une requête de suppression.
     */
    static async delete(sql, params = []) {
        try {
            const [result] = await (0, db_1.getPool)().execute(sql, params);
            return result;
        }
        catch (error) {
            console.error("❌ Erreur SQL lors de la suppression :", error);
            throw error;
        }
    }
    /**
     * Tester la connexion.
     */
    static async testConnection() {
        let connection;
        try {
            connection = await (0, db_1.getPool)().getConnection();
            await connection.ping();
            return true;
        }
        catch (error) {
            console.error("❌ Erreur de connexion à la base de données :", error);
            return false;
        }
        finally {
            if (connection) {
                connection.release();
            }
        }
    }
    /**
     * Fermer le pool de connexions.
     */
    static async closePool() {
        try {
            await (0, db_1.getPool)().end();
        }
        catch (error) {
            console.error("❌ Erreur lors de la fermeture du pool :", error);
        }
    }
}
exports.DatabaseService = DatabaseService;
exports.default = DatabaseService;
