'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import api from '@/lib/api';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/useAuthStore';

interface Variant {
    id: number;
    size: string;
    color: string;
    stock: number;
    price: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    images: { imageUrl: string }[];
    variants: Variant[];
}

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                if (res.data.variants.length > 0) {
                    setSelectedVariant(res.data.variants[0]);
                }
            } catch (e) {
                console.error('Error fetching product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

        // Real-time Stock Updates
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

        socket.on('stockUpdated', (data: any) => {
            if (data.productId === Number(id)) {
                setProduct(prev => {
                    if (!prev) return null;
                    const updatedVariants = prev.variants.map(v =>
                        v.id === data.variantId ? { ...v, stock: data.newStock } : v
                    );

                    // Also update selected variant if it matches
                    setSelectedVariant(prevSel =>
                        prevSel?.id === data.variantId ? { ...prevSel, stock: data.newStock } : prevSel
                    );

                    return { ...prev, variants: updatedVariants };
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    const addToCart = async () => {
        if (!isAuthenticated) {
            alert('Please login to add to cart');
            return;
        }
        if (!selectedVariant) return;
        if (selectedVariant.stock <= 0) {
            alert('Out of stock');
            return;
        }

        try {
            await api.post('/cart/add', { variantId: selectedVariant.id, quantity: 1 });
            alert('Added to cart');
        } catch (e) {
            alert('Failed to add to cart');
        }
    };

    if (loading || !product) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-white text-black">
            <Header />

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Images */}
                <div className="space-y-4">
                    {product.images.map((img, idx) => (
                        <div key={idx} className="aspect-[3/4] bg-gray-100 overflow-hidden">
                            <img src={img.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                {/* Details - Sticky on Desktop */}
                <div className="md:sticky md:top-24 h-fit">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{product.name}</h1>
                    <p className="text-xl font-mono mb-6">₹{selectedVariant?.price}</p>

                    <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

                    {/* Variants */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Select Size</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.variants.map(variant => (
                                <button
                                    key={variant.id}
                                    onClick={() => setSelectedVariant(variant)}
                                    disabled={variant.stock === 0}
                                    className={`px-6 py-3 border font-bold text-sm transition-all
                                ${selectedVariant?.id === variant.id ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}
                                ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed decoration-line-through' : ''}
                            `}
                                >
                                    {variant.size}
                                    {variant.stock < 5 && variant.stock > 0 && <span className="text-xs ml-1 text-red-500">Only {variant.stock} left!</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <button
                        onClick={addToCart}
                        disabled={!selectedVariant || selectedVariant.stock === 0}
                        className="w-full bg-red-600 text-white py-4 font-black uppercase tracking-widest hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-lg"
                    >
                        {selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    {/* Additional Info */}
                    <div className="mt-8 border-t pt-6 space-y-4 text-xs text-gray-500">
                        <p>Free shipping on orders over ₹2000</p>
                        <p>14 days easy return policy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
