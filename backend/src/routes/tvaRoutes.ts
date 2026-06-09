import { Router } from 'express';
import { TvaController } from '../controllers/tvaController';

const router = Router();

// Routes pour les taux de TVA
router.get('/', TvaController.getAllTva);
router.get('/actives', TvaController.getActiveTva);
router.get('/export/csv', TvaController.exportTvaCSV);
router.get('/:id', TvaController.getTvaById);
router.post('/calculer-ttc', TvaController.calculerTTC);

console.log('📋 Routes TVA chargées');

export default router;
