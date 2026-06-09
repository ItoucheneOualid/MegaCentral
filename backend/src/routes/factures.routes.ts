import { Router } from 'express';
import { FacturesController } from '../controllers/facturesController';

const router = Router();

// Obtenir toutes les factures
router.get('/', FacturesController.getAllFactures);

// Obtenir les détails d'une facture
router.get('/:id', FacturesController.getFactureDetails);

// Obtenir le PDF d'une facture
router.get('/:id/pdf', FacturesController.getFacturePDF);

// Sauvegarder un PDF généré en base64
router.post('/:id/pdf', FacturesController.saveFacturePDF);

// Générer et sauvegarder un PDF
router.post('/:id/generate-pdf', FacturesController.generateAndSavePDF);

// Réparer tous les PDF manquants
router.post('/repair-all-pdfs', FacturesController.repairAllPDFs);

export default router;