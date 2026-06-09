"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rapportsZController_1 = require("../controllers/rapportsZController");
const router = (0, express_1.Router)();
// Routes pour les rapports Z
router.get('/', rapportsZController_1.RapportsZController.getAllRapportsZ);
router.get('/export/csv', rapportsZController_1.RapportsZController.exportRapportsZCSV);
router.get('/magasin/:codeMagasin', rapportsZController_1.RapportsZController.getRapportsZByMagasin);
router.get('/periode', rapportsZController_1.RapportsZController.getRapportsZByPeriode);
exports.default = router;
