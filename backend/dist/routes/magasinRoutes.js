"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const magasinController_1 = require("../controllers/magasinController");
const router = (0, express_1.Router)();
// Routes pour les magasins
router.get('/', magasinController_1.MagasinController.getMagasinsFromDb);
router.get('/users', magasinController_1.MagasinController.getMagasinsFromUsers);
router.get('/rapports/:code_magasin', magasinController_1.MagasinController.getRapportsZByMagasin);
exports.default = router;
