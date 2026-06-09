"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.getPool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "Walid@19960";
const DB_NAME = process.env.DB_NAME || "idmegacentral";
let pool = null;
const getPool = () => {
    if (!pool) {
        pool = promise_1.default.createPool({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 10000
        });
    }
    return pool;
};
exports.getPool = getPool;
const testConnection = async () => {
    try {
        const p = (0, exports.getPool)();
        const conn = await p.getConnection();
        await conn.ping();
        conn.release();
        return true;
    }
    catch (err) {
        console.error("Database connection error:", err);
        return false;
    }
};
exports.testConnection = testConnection;
