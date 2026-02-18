import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
    hashPassword,
    comparePassword,
    generateToken,
    generateAdminToken,
    generate2FASecret,
    verify2FAToken,
    generateQRCode
} from '../utils/security';
import speakeasy from 'speakeasy';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: 'CUSTOMER' // Default role
            }
        });

        const token = generateToken({ userId: user.id, role: user.role });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({ message: 'User registered', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ userId: user.id, role: user.role });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: 'Login successful', user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ADMIN: Step 1 - Verify Credentials
export const adminLoginStep1 = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        // Security: Don't reveal admin existence. If not admin, return generic error.
        if (!user || user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.passwordHash!);
        if (!isValid) {
            // Log attempt
            await prisma.adminLoginLog.create({
                data: { userId: user.id, ipAddress: req.ip || 'unknown', status: 'FAILED_PASSWORD' }
            });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Passwords match. Check 2FA status.
        if (!user.is2FAEnabled) {
            // First time admin login? Or forced setup.
            // In this architecture, we might require one-time setup.
            return res.json({
                step: '2fa_setup_needed',
                userId: user.id
            });
        }

        return res.json({ step: '2fa_required', userId: user.id });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ADMIN: Step 2/Setup - Setup 2FA (Only if not enabled)
export const setup2FA = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        // Verify user exists and is admin and 2FA NOT enabled
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'ADMIN' || user.is2FAEnabled) {
            return res.status(403).json({ message: 'Not allowed' });
        }

        const secret = speakeasy.generateSecret({ name: `DECK (${user.email})` });
        const qrCodeUrl = await generateQRCode(secret.otpauth_url!);

        // Save temp secret
        await prisma.user.update({
            where: { id: userId },
            data: { twoFATempSecret: secret.base32 }
        });

        res.json({ secret: secret.base32, qrCode: qrCodeUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error setting up 2FA' });
    }
}

// ADMIN: Verify 2FA & Login
export const verifyAdmin2FA = async (req: Request, res: Response) => {
    try {
        const { userId, token } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        let secret = user.twoFASecret;

        // Use temp secret if we are in setup mode
        if (!user.is2FAEnabled && user.twoFATempSecret) {
            secret = user.twoFATempSecret;
            // If verification succeeds, we promote temp to actual secret
        } else if (!user.is2FAEnabled && !user.twoFATempSecret) {
            return res.status(400).json({ message: '2FA not set up' });
        }

        // Verify
        const verified = speakeasy.totp.verify({
            secret: secret!,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (verified) {
            // If was using temp, finalize it
            if (!user.is2FAEnabled) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        is2FAEnabled: true,
                        twoFASecret: secret,
                        twoFATempSecret: null
                    }
                });
            }

            // Generate Admin Token
            const adminToken = generateAdminToken({ userId: user.id, role: 'ADMIN' });

            // Log success
            await prisma.adminLoginLog.create({
                data: { userId: user.id, ipAddress: req.ip || 'unknown', status: 'SUCCESS' }
            });

            res.cookie('adminToken', adminToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000 // 15 mins
            });

            res.json({ message: 'Admin login successful', token: adminToken });
        } else {
            await prisma.adminLoginLog.create({
                data: { userId: user.id, ipAddress: req.ip || 'unknown', status: 'FAILED_2FA' }
            });
            res.status(401).json({ message: 'Invalid OTP' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
