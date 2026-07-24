"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.getPool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_CONFIG = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Walid@19960",
    database: process.env.DB_NAME || "idmegacentral",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    idleTimeout: 60000,
    enableKeepAlive: true
};
let pool = null;
const getPool = () => {
    if (!pool) {
        pool = promise_1.default.createPool(DB_CONFIG);
    }
    return pool;
};
exports.getPool = getPool;
const testConnection = async () => {
    let connection;
    try {
        connection = await (0, exports.getPool)().getConnection();
        await connection.ping();
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
    finally {
        if (connection) {
            await connection.release();
        }
    }
};
exports.testConnection = testConnection;
