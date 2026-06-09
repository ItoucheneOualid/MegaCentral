import { Router } from 'express';
import {
  getFamilles1,
  getFamille1ById,
  getFamilles2,
  getFamille2ById,
} from '../controllers/familles.controller';

const router = Router();

// Familles1 routes
router.get('/familles1', getFamilles1);
router.get('/familles1/:id', getFamille1ById);

// Familles2 routes
router.get('/familles2', getFamilles2);
router.get('/familles2/:id', getFamille2ById);

export default router;
