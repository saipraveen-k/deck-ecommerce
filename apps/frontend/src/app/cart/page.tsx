'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/useAuthStore';

interface CartItem {
    id: number;
    quantity: number;
    variant: {
        price: string;
        size: string;
        product: {
            name: string;
            images: { imageUrl: string }[];
        }
    }
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const res = await api.get('/cart');
            setCartItems(res.data.items || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const updateQuantity = async (itemId: number, newQty: number) => {
        try {
            if (newQty < 1) return removeItem(itemId);
            await api.put('/cart/update', { itemId, quantity: newQty });
            fetchCart();
        } catch (e) { console.error(e); }
    };

    const removeItem = async (itemId: number) => {
        try {
            await api.delete(`/cart/${itemId}`);
            fetchCart();
        } catch (e) { console.error(e); }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.variant.price) * item.quantity), 0);

    if (!isAuthenticated) return <div className="p-20 text-center">Please login to view cart</div>;
    if (loading) return <div className="p-20 text-center">Loading Cart...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Items */}
                        <div className="flex-1 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex bg-white p-4 items-center">
                                    <img src={item.variant.product.images[0]?.imageUrl} className="w-20 h-24 object-cover mr-4" />
                                    <div className="flex-1">
                                        <h3 className="font-bold uppercase">{item.variant.product.name}</h3>
                                        <p className="text-sm text-gray-500">Size: {item.variant.size}</p>
                                        <p className="font-mono">₹{item.variant.price}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 px-3 bg-gray-100">-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 px-3 bg-gray-100">+</button>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="ml-4 text-red-500 font-bold">X</button>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="w-full md:w-80 bg-white p-6 h-fit sticky top-24">
                            <h3 className="font-bold uppercase tracking-widest mb-4">Order Summary</h3>
                            <div className="flex justify-between mb-2 text-sm">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-4 text-sm text-gray-500">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6">
                                <span>Total</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <button className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-gray-800">
                                Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
