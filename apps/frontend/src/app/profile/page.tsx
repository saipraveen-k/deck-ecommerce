'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/useAuthStore';

export default function Profile() {
    const [orders, setOrders] = useState([]);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/history');
                setOrders(res.data);
            } catch (e) { console.error(e); }
        };
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-white text-black">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">My Account</h1>
                <p className="text-gray-500 mb-8">Welcome back, {user?.name}</p>

                <h2 className="text-xl font-bold border-b pb-4 mb-6">Order History</h2>

                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <div key={order.id} className="border border-gray-200 p-6 rounded-lg">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <p className="font-bold">Order #{order.id}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{order.totalAmount}</p>
                                    <span className={`text-xs px-2 py-1 rounded ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center text-sm">
                                        <img src={item.variant.product.images[0]?.imageUrl} className="w-10 h-10 object-cover mr-4 rounded" />
                                        <span className="flex-1">{item.variant.product.name} ({item.variant.size})</span>
                                        <span>x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && <p>No orders found.</p>}
                </div>
            </div>
        </div>
    );
}
