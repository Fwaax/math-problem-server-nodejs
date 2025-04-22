import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET!;

export function generateToken(userId: string) {
    return jwt.sign({ sub: userId }, SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string) {
    return jwt.verify(token, SECRET) as { sub: string };
}
