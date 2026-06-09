import { Router } from 'express';
import { getTickets, getTicketById, getTicketPDF, saveTicketPDF, generateAndSaveTicketPDF } from '../controllers/tickets.controller';

const router = Router();

// Routes principales pour les tickets
router.get('/', getTickets);
router.get('/:id', getTicketById);

// Routes pour la gestion des PDF par numéro de ticket
router.get('/pdf/:id', getTicketPDF);
router.post('/pdf/:id', saveTicketPDF);
router.post('/generate-pdf/:id', generateAndSaveTicketPDF);

export default router;