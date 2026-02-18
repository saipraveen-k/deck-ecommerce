import express from 'express';
import { register, login, adminLoginStep1, setup2FA, verifyAdmin2FA } from '../controllers/authController';

const router = express.Router();

// Customer
router.post('/register', register);
router.post('/login', login);

// Admin
router.post('/admin-login', adminLoginStep1);
router.post('/admin-2fa-setup', setup2FA); // Internal use, secured by logic
router.post('/admin-verify', verifyAdmin2FA);

export default router;
