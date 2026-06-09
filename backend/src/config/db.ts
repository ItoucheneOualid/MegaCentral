import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();


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
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    if (connection) {
      await connection.release();
    }
  }
};