import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                images: true
                            }
                        }
                    }
                }
            }
        });

        if (!cart) return res.json({ items: [] });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart' });
    }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { variantId, quantity } = req.body;

        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, variantId: Number(variantId) }
        });

        // Check stock logic could be added here

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + Number(quantity) }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId: Number(variantId),
                    quantity: Number(quantity)
                }
            });
        }

        res.json({ message: 'Item added to cart' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart' });
    }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { itemId, quantity } = req.body;

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Ensure item belongs to user's cart
        const item = await prisma.cartItem.findUnique({ where: { id: Number(itemId) } });
        if (!item || item.cartId !== cart.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (quantity <= 0) {
            await prisma.cartItem.delete({ where: { id: Number(itemId) } });
        } else {
            await prisma.cartItem.update({ where: { id: Number(itemId) }, data: { quantity: Number(quantity) } });
        }

        res.json({ message: 'Cart updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart' });
    }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = await prisma.cartItem.findUnique({ where: { id: Number(itemId) } });
        if (!item || item.cartId !== cart.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await prisma.cartItem.delete({ where: { id: Number(itemId) } });
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing item' });
    }
}
