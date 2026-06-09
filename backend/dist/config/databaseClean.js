"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
exports.DatabaseService = {
    async query(sql, params) {
        try {
            // Configuration propre sans options invalides
            const connection = await promise_1.default.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'Walid@19960',
                database: 'idmegacentral',
                charset: 'utf8mb4'
            });
            const [rows] = await connection.execute(sql, params);
            await connection.end();
            return rows;
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
};
