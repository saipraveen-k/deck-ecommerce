import express from 'express';
import { authenticate } from '../middleware/auth';
import { addToCart, getCart, updateCartItem, removeCartItem } from '../controllers/cartController';

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/:itemId', removeCartItem);

export default router;
