import { Router } from 'express';
import { RapportsZController } from '../controllers/rapportsZController';

const router = Router();

// Routes pour les rapports Z
router.get('/', RapportsZController.getAllRapportsZ);
router.get('/export/csv', RapportsZController.exportRapportsZCSV);
router.get('/magasin/:codeMagasin', RapportsZController.getRapportsZByMagasin);
router.get('/periode', RapportsZController.getRapportsZByPeriode);

export default router;
