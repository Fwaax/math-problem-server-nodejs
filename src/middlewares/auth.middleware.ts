import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: string;
    userFirstName?: string;
    userEmail?: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Missing or invalid token' });
        return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
        const payload = jwt.verify(token, JWT_SECRET) as {
            id: string;
            userFirstName: string;
            userEmail: string;
        };

        req.userId = payload.id;
        req.userFirstName = payload.userFirstName;
        req.userEmail = payload.userEmail;

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}
