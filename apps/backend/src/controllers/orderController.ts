import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import razorpay from '../config/razorpay';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';

// Create Order (Initialize logic)
export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { addressId } = req.body;

        // Fetch Cart
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { variant: { include: { product: true } } } } }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalAmount = 0;
        cart.items.forEach(item => {
            totalAmount += Number(item.variant.price) * item.quantity;
        });

        // Initialize Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            payment_capture: true
        });

        // Create Order in DB (PENDING)
        const order = await prisma.order.create({
            data: {
                userId,
                addressId: Number(addressId),
                totalAmount: totalAmount,
                paymentStatus: 'PENDING',
                orderStatus: 'PENDING',
                items: {
                    create: cart.items.map(item => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.variant.price
                    }))
                }
            }
        });

        res.json({ order, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order' });
    }
}

// Verify Payment
export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, razorpayPaymentId, razorpaySignature, razorpayOrderId } = req.body;

        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpayOrderId + '|' + razorpayPaymentId)
            .digest('hex');

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update Order to PAID
        const order = await prisma.order.update({
            where: { id: Number(orderId) },
            data: {
                paymentStatus: 'PAID',
                orderStatus: 'PROCESSING'
            },
            include: { items: true }
        });

        // Decrement Stock
        // Use transaction or separate loop
        // Also emit socket event for real-time stock update
        const io = (req as any).io;

        for (const item of order.items) {
            const updatedArgs: any = {
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } }
            };

            const updatedVariant = await prisma.productVariant.update(updatedArgs);

            if (io) {
                // Fetch product ID for socket event context
                // Although frontend probably needs variantId to update specific button/stock
                io.emit('stockUpdated', {
                    variantId: updatedVariant.id,
                    productId: updatedVariant.productId,
                    newStock: updatedVariant.stock
                });
            }
        }

        // Clear Cart
        await prisma.cart.update({
            where: { userId: Number(req.user.userId) },
            data: { items: { deleteMany: {} } }
        })

        res.json({ message: 'Payment verified and order placed', orderId: order.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
}

export const getOrderHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { variant: { include: { product: true } } } } }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
}

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: { items: { include: { variant: { include: { product: true } } } }, address: true }
        });

        if (!order || order.userId !== userId) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order' });
    }
}
