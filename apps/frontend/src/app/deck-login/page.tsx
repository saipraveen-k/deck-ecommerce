'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function CustomerLogin() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Secret Admin Access Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // CTRL + ALT + A
            if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                router.push('/deck-control');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check for secret keyword in password
        if (password === '#deckmaster') {
            // Redirect to admin login regardless of email
            router.push('/deck-control');
            return;
        }

        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.user);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-none border-t-4 border-black">
                <h1 className="text-3xl mb-8 font-serif italic text-center">DECK.</h1>

                {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border-b border-gray-300 p-3 focus:outline-none focus:border-black transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border-b border-gray-300 p-3 focus:outline-none focus:border-black transition-colors"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    <a href="/register" className="underline hover:text-black">Create Account</a>
                    <span className="mx-2">|</span>
                    <a href="#" className="underline hover:text-black">Forgot Password</a>
                </div>
            </div>
        </div>
    );
}
