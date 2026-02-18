import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const SALT_ROUNDS = 10;
const JWT_SECRET = (process.env.JWT_SECRET || 'supersecretkey') as string;
const ADMIN_JWT_SECRET = (process.env.ADMIN_JWT_SECRET || 'superadminsecretkey') as string;

// Password Hashing
export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

// JWT Tokens
export const generateToken = (payload: any, expiresIn = '7d') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
};

export const generateAdminToken = (payload: any) => {
    return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '15m' } as jwt.SignOptions);
};

export const verifyAdminToken = (token: string) => {
    return jwt.verify(token, ADMIN_JWT_SECRET);
};

// 2FA
export const generate2FASecret = (email: string) => {
    const secret = speakeasy.generateSecret({ length: 20, name: `DECK (${email})` });
    return secret;
};

export const verify2FAToken = (secret: string, token: string) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 30sec margin
    });
};

export const generateQRCode = async (otpauthUrl: string) => {
    return await QRCode.toDataURL(otpauthUrl);
};
