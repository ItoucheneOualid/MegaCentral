import { Router } from 'express';
import { StockMagasinController } from '../controllers/stockMagasinController';

const router = Router();

// Routes principales pour la gestion des stocks
router.get('/', StockMagasinController.getAllStocks);
router.get('/alerts', StockMagasinController.getStockAlerts);
router.get('/magasin/:magasinId', StockMagasinController.getStocksByMagasin);
router.get('/article/:articleId', StockMagasinController.getStocksByArticle);
router.get('/:id', StockMagasinController.getStockById);
router.post('/', StockMagasinController.createStock);
router.put('/:id', StockMagasinController.updateStock);
router.delete('/:id', StockMagasinController.deleteStock);

export default router;
