"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facturesController_1 = require("../controllers/facturesController");
const router = (0, express_1.Router)();
// Obtenir toutes les factures
router.get('/', facturesController_1.FacturesController.getAllFactures);
// Obtenir les détails d'une facture
router.get('/:id', facturesController_1.FacturesController.getFactureDetails);
// Obtenir le PDF d'une facture
router.get('/:id/pdf', facturesController_1.FacturesController.getFacturePDF);
// Sauvegarder un PDF généré en base64
router.post('/:id/pdf', facturesController_1.FacturesController.saveFacturePDF);
// Générer et sauvegarder un PDF
router.post('/:id/generate-pdf', facturesController_1.FacturesController.generateAndSavePDF);
// Réparer tous les PDF manquants
router.post('/repair-all-pdfs', facturesController_1.FacturesController.repairAllPDFs);
exports.default = router;
