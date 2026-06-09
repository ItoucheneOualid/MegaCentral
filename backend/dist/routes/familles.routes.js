"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const familles_controller_1 = require("../controllers/familles.controller");
const router = (0, express_1.Router)();
// Familles1 routes
router.get('/familles1', familles_controller_1.getFamilles1);
router.get('/familles1/:id', familles_controller_1.getFamille1ById);
// Familles2 routes
router.get('/familles2', familles_controller_1.getFamilles2);
router.get('/familles2/:id', familles_controller_1.getFamille2ById);
exports.default = router;
