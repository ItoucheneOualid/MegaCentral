"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tickets_controller_1 = require("../controllers/tickets.controller");
const apiKeyMiddleware_1 = require("../middleware/apiKeyMiddleware");
const router = (0, express_1.Router)();
// Import de masse depuis MegaCaisse (clé API dédiée, pas de session utilisateur)
router.post('/import', apiKeyMiddleware_1.authenticateMegaCaisse, tickets_controller_1.importTickets);
// Routes principales pour les tickets
router.get('/', tickets_controller_1.getTickets);
router.get('/:id', tickets_controller_1.getTicketById);
// Routes pour la gestion des PDF par numéro de ticket
router.get('/pdf/:id', tickets_controller_1.getTicketPDF);
router.post('/pdf/:id', tickets_controller_1.saveTicketPDF);
router.post('/generate-pdf/:id', tickets_controller_1.generateAndSaveTicketPDF);
exports.default = router;
