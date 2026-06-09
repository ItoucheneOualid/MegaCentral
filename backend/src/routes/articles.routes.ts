import { Router } from 'express';
import { getArticles, getArticleById, updateArticle, createArticle, deleteArticle } from '../controllers/articles.controller';
import { authenticateToken, requirePermission, requireReadAccess } from '../middleware/permissionMiddleware';
import { Permission } from '../types/permissions';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les articles avec permissions
router.get('/', requireReadAccess, getArticles);                    // Tout le monde peut lire
router.get('/:id', requireReadAccess, getArticleById);               // Tout le monde peut lire
router.post('/', requirePermission(Permission.ARTICLES_CREATE), createArticle);     // Admin uniquement
router.put('/:id', requirePermission(Permission.ARTICLES_UPDATE), updateArticle);    // Admin uniquement
router.delete('/:id', requirePermission(Permission.ARTICLES_DELETE), deleteArticle); // Admin uniquement

export default router;