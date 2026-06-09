"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fournisseursController_1 = require("../controllers/fournisseursController");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const permissions_1 = require("../types/permissions");
const router = (0, express_1.Router)();
// Routes pour les fournisseurs (FRN)
router.get('/', permissionMiddleware_1.authenticateToken, (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.FOURNISSEURS_VIEW), fournisseursController_1.FournisseursController.getAllFournisseurs);
router.post('/', permissionMiddleware_1.authenticateToken, (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.FOURNISSEURS_CREATE), fournisseursController_1.FournisseursController.addFournisseur);
router.get('/:id', permissionMiddleware_1.authenticateToken, (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.FOURNISSEURS_VIEW), fournisseursController_1.FournisseursController.getFournisseurById);
router.put('/:id', permissionMiddleware_1.authenticateToken, (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.FOURNISSEURS_UPDATE), fournisseursController_1.FournisseursController.updateFournisseur);
router.delete('/:id', permissionMiddleware_1.authenticateToken, (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.FOURNISSEURS_DELETE), fournisseursController_1.FournisseursController.deleteFournisseur);
router.get('/export/csv', permissionMiddleware_1.authenticateToken, (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.FOURNISSEURS_EXPORT), fournisseursController_1.FournisseursController.exportFournisseursCSV);
exports.default = router;
