import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

export interface AuthRequest extends Request {
    userId?: string;
}

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        // send response, then exit without returning the response object
        res.status(401).json({ message: 'Missing or invalid token' });
        return;
    }

    try {
        const payload = verifyToken(auth.substring(7));
        req.userId = payload.sub;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
}