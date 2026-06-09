"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tickets_controller_1 = require("../controllers/tickets.controller");
const router = (0, express_1.Router)();
// Routes principales pour les tickets
router.get('/', tickets_controller_1.getTickets);
router.get('/:id', tickets_controller_1.getTicketById);
// Routes pour la gestion des PDF par numéro de ticket
router.get('/pdf/:id', tickets_controller_1.getTicketPDF);
router.post('/pdf/:id', tickets_controller_1.saveTicketPDF);
router.post('/generate-pdf/:id', tickets_controller_1.generateAndSaveTicketPDF);
exports.default = router;
