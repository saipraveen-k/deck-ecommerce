'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">

                {/* Mobile Menu */}
                <button className="md:hidden">
                    <Menu className="w-6 h-6" />
                </button>

                {/* Logo */}
                <Link href="/" className="text-2xl font-serif font-black tracking-tighter italic hover:opacity-80 transition-opacity">
                    DECK.
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <Link href="/?category=men" className="hover:text-black transition-colors">Men</Link>
                    <Link href="/?category=women" className="hover:text-black transition-colors">Women</Link>
                    <Link href="/?category=kids" className="hover:text-black transition-colors">Kids</Link>
                    <Link href="/?category=sale" className="text-red-600 hover:text-red-700 transition-colors">Sale</Link>
                </nav>

                {/* Icons */}
                <div className="flex items-center space-x-6">
                    <button className="hover:opacity-70">
                        <Search className="w-5 h-5" />
                    </button>
                    <div className="relative group">
                        <Link href={isAuthenticated ? "/profile" : "/deck-login"}>
                            <User className="w-5 h-5 hover:opacity-70" />
                        </Link>
                        {/* Dropdown if logged in */}
                        {isAuthenticated && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                                <div className="p-4 text-xs">
                                    <p className="font-bold mb-2">{user?.name}</p>
                                    {user?.role === 'ADMIN' && (
                                        <Link href="/admin/dashboard" className="block text-red-600 mb-2">Admin Panel</Link>
                                    )}
                                    <button onClick={logout} className="text-gray-500 hover:text-black">Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <Link href="/cart" className="relative hover:opacity-70">
                        <ShoppingBag className="w-5 h-5" />
                        {/* Badge could go here */}
                    </Link>
                </div>
            </div>
        </header>
    );
}
