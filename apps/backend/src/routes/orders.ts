import express from 'express';
import { authenticate } from '../middleware/auth';
import { createOrder, verifyPayment, getOrderHistory, getOrderById } from '../controllers/orderController';

const router = express.Router();

router.use(authenticate);

router.post('/create', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/history', getOrderHistory);
router.get('/:id', getOrderById);

export default router;
