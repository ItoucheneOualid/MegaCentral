import { Router } from 'express';
import { getTickets, getTicketById, getTicketPDF, saveTicketPDF, generateAndSaveTicketPDF, importTickets } from '../controllers/tickets.controller';
import { authenticateMegaCaisse } from '../middleware/apiKeyMiddleware';

const router = Router();

// Import de masse depuis MegaCaisse (clé API dédiée, pas de session utilisateur)
router.post('/import', authenticateMegaCaisse, importTickets);

// Routes principales pour les tickets
router.get('/', getTickets);
router.get('/:id', getTicketById);

// Routes pour la gestion des PDF par numéro de ticket
router.get('/pdf/:id', getTicketPDF);
router.post('/pdf/:id', saveTicketPDF);
router.post('/generate-pdf/:id', generateAndSaveTicketPDF);

export default router;