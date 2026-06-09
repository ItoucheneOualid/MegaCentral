import { Router } from 'express';
import { MouvementsStockController } from '../controllers/mouvementsStockController';

const router = Router();

// POST /api/mouvements-stock/sortie - Sortir du stock
router.post('/sortie', MouvementsStockController.sortieStock);

// GET /api/mouvements-stock/historique - Historique des mouvements
router.get('/historique', MouvementsStockController.getHistorique);

// GET /api/mouvements-stock/statistiques - Statistiques des mouvements
router.get('/statistiques', MouvementsStockController.getStatistiques);

export default router;
