"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commandesController_1 = require("../controllers/commandesController");
const router = (0, express_1.Router)();
// Routes pour les commandes (BC_FRN, BC_LINE)
router.get('/', commandesController_1.CommandesController.getAllCommandes);
router.post('/', commandesController_1.CommandesController.createCommande);
router.get('/export/csv', commandesController_1.CommandesController.exportCommandesCSV);
router.get('/:id', commandesController_1.CommandesController.getCommandeById);
exports.default = router;
