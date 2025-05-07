import express from 'express';
import { loginSchema } from '../schemas/user.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getUserByEmail } from '../repositories/db.repository';

const router = express.Router();

router.post('/login', async (req: AuthRequest, res) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
        res.status(400).json({ data: null, message: parseResult.error.flatten().fieldErrors });
        return;
    }

    const { email, password } = parseResult.data;

    try {
        const user = await getUserByEmail(email);
        if (!user) {
            res.status(403).json({ message: 'Email or password is incorrect' });
            return;
        }
        const passwordMatch = await bcrypt.compare(password, user.hashed_password);
        if (!passwordMatch) {
            res.status(403).json({ message: 'Email or password is incorrect' });
            return;
        }

        const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ token, user: { email: user.email, firstName: user.first_name } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;