'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/deck-control');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-mono flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 p-6">
                <h2 className="text-2xl font-bold text-red-500 mb-8">DECK ADMIN</h2>
                <nav className="space-y-4">
                    <a href="/admin/dashboard" className="block p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white">Dashboard</a>
                    <a href="/admin/products" className="block p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white">Products</a>
                    <a href="/admin/orders" className="block p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white">Orders</a>
                    <a href="/admin/users" className="block p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white">Users</a>
                    <a href="/" className="block p-2 mt-8 text-xs text-gray-500 hover:text-white">Back to Live Site</a>
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
