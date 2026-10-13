import { Router } from 'express';
import { importMegaCaisseBatch } from '../controllers/megaCaisseSyncController';

const router = Router();

router.post('/', importMegaCaisseBatch);

export default router;
