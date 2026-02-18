import express from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { createProduct, updateStock, updateProductStatus } from '../controllers/productController';

const router = express.Router();

// Apply Admin Middleware to all routes
router.use(authenticateAdmin);

// Products
router.post('/product', createProduct);
router.put('/product/:id/status', updateProductStatus);
router.put('/stock', updateStock);

// Example Order Management routes (placeholder)
// router.get('/orders', getAdminOrders);
// router.put('/order/:id/status', updateOrderStatus);

export default router;
