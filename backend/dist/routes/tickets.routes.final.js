"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketsControllerFinal_1 = require("../controllers/ticketsControllerFinal");
const router = (0, express_1.Router)();
// Routes principales pour les tickets
router.get('/', ticketsControllerFinal_1.TicketsController.getAllTickets);
// Routes pour la gestion des PDF par numéro de ticket
router.get('/pdf/:numero', ticketsControllerFinal_1.TicketsController.getTicketPDF);
router.post('/pdf/:numero', ticketsControllerFinal_1.TicketsController.saveTicketPDF);
router.post('/generate-pdf/:numero', ticketsControllerFinal_1.TicketsController.generateAndSaveTicketPDF);
exports.default = router;
