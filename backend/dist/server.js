"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        const dbConnected = await (0, db_1.testConnection)();
        if (!dbConnected) {
            console.error('❌ Database connection failed');
            process.exit(1);
        }
        console.log('✅ Database connected');
        app_1.default.listen(PORT, () => {
            console.log(`🚀 MEGA-Central API running on port ${PORT}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
