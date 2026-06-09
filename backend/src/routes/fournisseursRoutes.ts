import { Router } from 'express';
import { FournisseursController } from '../controllers/fournisseursController';
import { authenticateToken, requirePermission } from '../middleware/permissionMiddleware';
import { Permission } from '../types/permissions';

const router = Router();

// Routes pour les fournisseurs (FRN)
router.get('/', authenticateToken, requirePermission(Permission.FOURNISSEURS_VIEW), FournisseursController.getAllFournisseurs);
router.post('/', authenticateToken, requirePermission(Permission.FOURNISSEURS_CREATE), FournisseursController.addFournisseur);
router.get('/:id', authenticateToken, requirePermission(Permission.FOURNISSEURS_VIEW), FournisseursController.getFournisseurById);
router.put('/:id', authenticateToken, requirePermission(Permission.FOURNISSEURS_UPDATE), FournisseursController.updateFournisseur);
router.delete('/:id', authenticateToken, requirePermission(Permission.FOURNISSEURS_DELETE), FournisseursController.deleteFournisseur);
router.get('/export/csv', authenticateToken, requirePermission(Permission.FOURNISSEURS_EXPORT), FournisseursController.exportFournisseursCSV);

export default router;
