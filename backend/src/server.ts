import app from './app';
import dotenv from 'dotenv';
import { testConnection } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 MEGA-Central API running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();