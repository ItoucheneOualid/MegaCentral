import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";
import { getRequiredEnvVar, getOptionalEnvVar } from "./env";

dotenv.config();

const DB_SSL_ENABLED =
  getOptionalEnvVar("DB_SSL", "false").toLowerCase() === "true";

const DB_CONFIG = {
  host: getOptionalEnvVar("DB_HOST", "localhost"),
  port: Number(getOptionalEnvVar("DB_PORT", "3306")),
  user: getOptionalEnvVar("DB_USER", "root"),
  password: getRequiredEnvVar("DB_PASSWORD"),
  database: getRequiredEnvVar("DB_NAME"),

  ssl: DB_SSL_ENABLED
    ? {
        ca: getRequiredEnvVar("DB_CA_CERT").replace(/\\n/g, "\n"),
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

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }

  return pool;
};

export const testConnection = async (): Promise<boolean> => {
  let connection;

  try {
    connection = await getPool().getConnection();
    await connection.ping();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};