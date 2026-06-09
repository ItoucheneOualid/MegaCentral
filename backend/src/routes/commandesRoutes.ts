import { Router } from 'express';
import { CommandesController } from '../controllers/commandesController';

const router = Router();

router.get('/', CommandesController.getAllCommandes);
router.get('/fournisseurs', CommandesController.getFournisseurs);
router.get('/articles', CommandesController.getArticlesCommandables);
router.get('/export/csv', CommandesController.exportCommandesCSV);

router.post('/', CommandesController.createCommande);

router.get('/:id', CommandesController.getCommandeById);
router.put('/:id', CommandesController.updateCommande);
router.patch('/:id/statut', CommandesController.updateStatutCommande);
router.delete('/:id', CommandesController.deleteCommande);

export default router;