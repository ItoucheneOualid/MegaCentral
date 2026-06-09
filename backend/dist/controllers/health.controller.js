"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const db_1 = require("../config/db");
const healthCheck = async (req, res) => {
    try {
        const dbOk = await (0, db_1.testConnection)();
        return res.status(200).json({
            status: "ok",
            db: dbOk ? "ok" : "error",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        return res.status(500).json({
            status: "error",
            db: "error",
            timestamp: new Date().toISOString(),
        });
    }
};
exports.healthCheck = healthCheck;
