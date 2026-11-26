'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function Register() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/register', { name, email, password });
            login(res.data.user);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-none border-t-4 border-black">
                <h1 className="text-3xl mb-8 font-serif italic text-center">JOIN THE DECK.</h1>

                {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-gray-50 border-b border-gray-300 p-3 focus:outline-none focus:border-black transition-colors"
                            required
                        />
                    </div>
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
                        Create Account
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    <a href="/deck-login" className="underline hover:text-black">Already have an account? Sign In</a>
                </div>
            </div>
        </div>
    );
}
