import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Socket.io injection
app.use((req, res, next) => {
    (req as any).io = io;
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import adminRoutes from './routes/admin';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

export { app, httpServer, io };
