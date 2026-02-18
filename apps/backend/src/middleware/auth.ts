import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyAdminToken } from '../utils/security';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.adminToken || req.headers['x-admin-token'];

    if (!token) {
        return res.status(401).json({ message: 'Admin authentication required' });
    }

    try {
        const decoded = verifyAdminToken(token as string) as any;

        // Check strict database role + 2FA check if needed (though token implies passed)
        // Optionally: check if user still exists or is banned/role changed
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid admin token' });
    }
};
