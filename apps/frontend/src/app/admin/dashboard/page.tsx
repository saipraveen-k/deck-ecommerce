'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { io } from "socket.io-client";

interface Product {
    id: number;
    name: string;
    variants: any[];
}

export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState({ orders: 0, sales: 0 });

    useEffect(() => {
        fetchData();

        // Socket.io for Real-time updates (Optional here, but good for watching orders)
        // const socket = io('http://localhost:4000');
        // return () => socket.disconnect();
    }, []);

    const fetchData = async () => {
        try {
            const prodRes = await api.get('/products');
            setProducts(prodRes.data);

            // const statsRes = await api.get('/admin/stats');
            // setStats(statsRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    const updateStock = async (variantId: number, newStock: number) => {
        try {
            await api.put('/admin/stock', { variantId, stock: newStock });
            alert('Stock updated!');
            fetchData(); // Refresh or update local state
        } catch (e) {
            alert('Failed to update stock');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-800 p-6 rounded border border-gray-700">
                    <h3 className="text-gray-400 text-sm uppercase">Total Sales</h3>
                    <p className="text-3xl font-bold text-green-500">₹{stats.sales.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded border border-gray-700">
                    <h3 className="text-gray-400 text-sm uppercase">Orders Today</h3>
                    <p className="text-3xl font-bold text-blue-500">{stats.orders}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded border border-gray-700">
                    <h3 className="text-gray-400 text-sm uppercase">Quick Actions</h3>
                    <button className="bg-red-600 text-white px-4 py-2 rounded text-sm mt-2 hover:bg-red-700">Add Product</button>
                </div>
            </div>

            {/* Inventory Quick View */}
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Inventory Management</h2>
            <div className="bg-gray-800 rounded overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Variant (SKU)</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm">
                        {products.map(p => (
                            p.variants.map(v => (
                                <tr key={v.id} className="hover:bg-gray-750">
                                    <td className="p-4">{p.name} <span className="text-gray-500 text-xs block">{v.color} / {v.size}</span></td>
                                    <td className="p-4 font-mono">{v.sku}</td>
                                    <td className="p-4">
                                        <input
                                            type="number"
                                            defaultValue={v.stock}
                                            onBlur={(e) => updateStock(v.id, Number(e.target.value))}
                                            className="bg-gray-900 border border-gray-600 rounded w-20 p-1 text-center"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${v.stock < 10 ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                                            {v.stock < 10 ? 'LOW STOCK' : 'OK'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
