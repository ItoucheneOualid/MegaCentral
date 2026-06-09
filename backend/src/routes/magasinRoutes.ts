import { Router } from 'express';
import { MagasinController } from '../controllers/magasinController';

const router = Router();

// Routes pour les magasins
router.get('/', MagasinController.getMagasinsFromDb);
router.get('/users', MagasinController.getMagasinsFromUsers);
router.get('/rapports/:code_magasin', MagasinController.getRapportsZByMagasin);

export default router;
