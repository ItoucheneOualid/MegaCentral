import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/authRoutes';
import articlesRoutes from './routes/articles.routes';
import ticketsRoutes from './routes/tickets.routes';
import facturesRoutes from './routes/factures.routes';
import famillesRoutes from './routes/familles.routes';
import fournisseursRoutes from './routes/fournisseursRoutes';
import commandesRoutes from './routes/commandesRoutes';
import rapportsZRoutes from './routes/rapportsZRoutes';
import debugRoutes from './routes/debugRoutes';
import tvaRoutes from './routes/tvaRoutes';
import magasinRoutes from './routes/magasinRoutes';
import emailRoutes from './routes/email.routes';
import photosRoutes from './routes/photos.routes';
import megaCaisseSyncRoutes from './routes/megaCaisseSyncRoutes';
import { authenticateMegaCaisse } from './middleware/apiKeyMiddleware';

import { DatabaseService } from './services/databaseService';
import { getOptionalEnvVar } from './config/env';

const app = express();

app.use(helmet());

// Dynamically configure CORS based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean)
  : [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080'
    ];

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.use(
  '/api/sync/megacaisse',
  authenticateMegaCaisse,
  express.json({ limit: '50mb' }),
  megaCaisseSyncRoutes
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tva', tvaRoutes);
app.use('/api/magasins', magasinRoutes);
app.use('/api/send-email', emailRoutes);
app.use('/api/photos', photosRoutes);

// Debug routes only in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
}

// Articles
app.use('/api/articles', articlesRoutes);

// Autres modules
app.use('/api/tickets', ticketsRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/familles', famillesRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/rapports-z', rapportsZRoutes);

// Initialiser la connexion au démarrage
DatabaseService.initializeConnection().then((connected) => {
  if (connected && process.env.NODE_ENV === 'production') {
    console.log('[INFO] MEGA-Central Backend - Production ready');
  }
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

export default app;