import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createProduct,
  getProducts,
  getProductById,
  getRecommendedProducts,
  updateProduct,
  deleteProduct,
  upload,
  uploadMultiple
} from '../controllers/product.controller';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/recommended', getRecommendedProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'additional_images', maxCount: 5 }
]), createProduct);
router.put('/:id', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'additional_images', maxCount: 5 }
]), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
