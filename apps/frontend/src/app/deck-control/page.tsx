'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLogin() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [step, setStep] = useState<'CREDENTIALS' | '2FA_SETUP' | '2FA_VERIFY'>('CREDENTIALS');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/admin-login', { email, password });

            if (res.data.step === '2fa_required') {
                setUserId(res.data.userId);
                setStep('2FA_VERIFY');
            } else if (res.data.step === '2fa_setup_needed') {
                // Trigger setup
                setUserId(res.data.userId);
                const setupRes = await api.post('/auth/admin-2fa-setup', { userId: res.data.userId });
                setQrCode(setupRes.data.qrCode);
                setStep('2FA_SETUP');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/admin-verify', { userId, token: otp });
            // Success
            // Decode token to get user info if needed, or just set generic admin user
            login({ id: userId!, name: 'Admin', email, role: 'ADMIN' });
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white font-mono">
            <div className="w-full max-w-md p-8 border border-gray-800 rounded-lg bg-gray-900">
                <h1 className="text-2xl mb-6 text-center text-red-500 font-bold">DECK CONTROL</h1>

                {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}

                {step === 'CREDENTIALS' && (
                    <form onSubmit={handleCredentials} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 p-2 rounded focus:outline-none focus:border-red-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 p-2 rounded focus:outline-none focus:border-red-500"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded font-bold">
                            ACCESS
                        </button>
                    </form>
                )}

                {step === '2FA_SETUP' && (
                    <div className="text-center">
                        <p className="mb-4 text-sm">Scan this QR code with Google Authenticator</p>
                        {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto mb-4 border-4 border-white" />}
                        <form onSubmit={handleVerify} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-center text-xl tracking-widest"
                                maxLength={6}
                                required
                            />
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded font-bold">
                                VERIFY & ENABLE
                            </button>
                        </form>
                    </div>
                )}

                {step === '2FA_VERIFY' && (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="text-center">
                            <label className="block text-sm mb-2 text-gray-400">Authenticator Code</label>
                            <input
                                type="text"
                                placeholder="000 000"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full bg-gray-800 border-b-2 border-red-500 p-3 rounded-none text-center text-2xl tracking-[0.5em] focus:outline-none"
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded font-bold tracking-wider">
                            AUTHENTICATE
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
