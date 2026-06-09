import { Request, Response } from "express";
import { testConnection } from "../config/db";

export const healthCheck = async (req: Request, res: Response) => {
  try {
    const dbOk = await testConnection();
    return res.status(200).json({
      status: "ok",
      db: dbOk ? "ok" : "error",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      db: "error",
      timestamp: new Date().toISOString(),
    });
  }
};