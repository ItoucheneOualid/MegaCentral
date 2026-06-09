import { Router } from 'express';
import {
  addPhotoToArticle,
  getPhotoByArticleId,
} from '../controllers/photos.controller';

const router = Router();

router.get('/:id', getPhotoByArticleId);
router.post('/:id', addPhotoToArticle);

export default router;