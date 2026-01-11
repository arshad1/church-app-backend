
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (user && (user.role === 'ADMIN' || user.role === 'PASTOR')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};
