"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articles_controller_1 = require("../controllers/articles.controller");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const permissions_1 = require("../types/permissions");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(permissionMiddleware_1.authenticateToken);
// Routes pour les articles avec permissions
router.get('/', permissionMiddleware_1.requireReadAccess, articles_controller_1.getArticles); // Tout le monde peut lire
router.get('/:id', permissionMiddleware_1.requireReadAccess, articles_controller_1.getArticleById); // Tout le monde peut lire
router.post('/', (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.ARTICLES_CREATE), articles_controller_1.createArticle); // Admin uniquement
router.put('/:id', (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.ARTICLES_UPDATE), articles_controller_1.updateArticle); // Admin uniquement
router.delete('/:id', (0, permissionMiddleware_1.requirePermission)(permissions_1.Permission.ARTICLES_DELETE), articles_controller_1.deleteArticle); // Admin uniquement
exports.default = router;
