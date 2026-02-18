import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { io } from '../app'; // Removed to avoid circular dependency, using req.io instead

// Public: Get all products with filters
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, gender, search, sort } = req.query;

        const where: any = {
            status: 'ACTIVE'
        };

        if (category) where.categoryId = Number(category); // Assuming categoryId is Int
        if (gender) where.gender = String(gender);
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        const orderBy: any = {};
        if (sort === 'price_asc') orderBy.variants = { _min: { price: 'asc' } }; // Simplified, might need complex sorting
        else if (sort === 'price_desc') orderBy.variants = { _max: { price: 'desc' } };
        else orderBy.createdAt = 'desc';

        const products = await prisma.product.findMany({
            where,
            include: {
                variants: true,
                images: true
            },
            orderBy
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

// Public: Get single product
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                variants: true,
                images: true,
                reviews: true
            }
        });

        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// Admin: Create Product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, categoryId, brand, gender, variants, images } = req.body;

        // Transaction to ensure atomicity
        const product = await prisma.$transaction(async (tx) => {
            const newProduct = await tx.product.create({
                data: {
                    name, description, categoryId: Number(categoryId), brand, gender, status: 'DRAFT'
                }
            });

            // Create Variants
            if (variants && variants.length > 0) {
                await tx.productVariant.createMany({
                    data: variants.map((v: any) => ({
                        productId: newProduct.id,
                        size: v.size,
                        color: v.color,
                        sku: v.sku,
                        price: v.price,
                        mrp: v.mrp,
                        stock: v.stock,
                        status: 'ACTIVE'
                    }))
                });
            }

            // Create Images
            if (images && images.length > 0) {
                await tx.productImage.createMany({
                    data: images.map((img: any) => ({
                        productId: newProduct.id,
                        imageUrl: img.url,
                        position: img.position
                    }))
                });
            }

            // Fetch the product again with its relations to return a complete object
            const createdProductWithRelations = await tx.product.findUnique({
                where: { id: newProduct.id },
                include: {
                    variants: true,
                    images: true,
                },
            });

            return createdProductWithRelations;
        });

        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product', error });
    }
}

// Admin: Update Stock (Real-time)
export const updateStock = async (req: Request, res: Response) => {
    try {
        const { variantId, stock } = req.body;

        const variant = await prisma.productVariant.update({
            where: { id: Number(variantId) },
            data: { stock: Number(stock) },
            include: { product: true }
        });

        // Real-time update
        // Need to cast req to access io if not imported, but we imported 'io' from app.ts (circular dependency risk? app.ts imports routes...)
        // Better to access io from req.app.get('io') or similar if circular dependency occurs.
        // But here we use 'io' exported from app.ts. If app.ts imports this file -> circular.
        // Solution: pass io in req by middleware (done in app.ts).

        const socketIo = (req as any).io;
        if (socketIo) {
            socketIo.emit('stockUpdated', {
                variantId: variant.id,
                productId: variant.productId,
                newStock: variant.stock
            });
        }

        res.json({ message: 'Stock updated', variant });
    } catch (error) {
        res.status(500).json({ message: 'Error updating stock' });
    }
}

// Admin: Update Product Status
export const updateProductStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // ACTIVE, INACTIVE, DRAFT

        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: { status }
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
}
