"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.getPool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("./env");
dotenv_1.default.config();
const DB_SSL_ENABLED = (0, env_1.getOptionalEnvVar)("DB_SSL", "false").toLowerCase() === "true";
const DB_CONFIG = {
    host: (0, env_1.getOptionalEnvVar)("DB_HOST", "localhost"),
    port: Number((0, env_1.getOptionalEnvVar)("DB_PORT", "3306")),
    user: (0, env_1.getOptionalEnvVar)("DB_USER", "root"),
    password: (0, env_1.getRequiredEnvVar)("DB_PASSWORD"),
    database: (0, env_1.getRequiredEnvVar)("DB_NAME"),
    ssl: DB_SSL_ENABLED
        ? {
            ca: (0, env_1.getRequiredEnvVar)("DB_CA_CERT").replace(/\\n/g, "\n"),
            rejectUnauthorized: true,
        }
        : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    idleTimeout: 60000,
    enableKeepAlive: true,
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
        console.error("❌ Database connection failed:", error);
        return false;
    }
    finally {
        if (connection) {
            connection.release();
        }
    }
};
exports.testConnection = testConnection;
