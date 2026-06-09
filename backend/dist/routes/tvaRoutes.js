"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tvaController_1 = require("../controllers/tvaController");
const router = (0, express_1.Router)();
// Routes pour les taux de TVA
router.get('/', tvaController_1.TvaController.getAllTva);
router.get('/actives', tvaController_1.TvaController.getActiveTva);
router.get('/export/csv', tvaController_1.TvaController.exportTvaCSV);
router.get('/:id', tvaController_1.TvaController.getTvaById);
router.post('/calculer-ttc', tvaController_1.TvaController.calculerTTC);
console.log('📋 Routes TVA chargées');
exports.default = router;
