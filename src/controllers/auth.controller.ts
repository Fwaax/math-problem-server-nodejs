import express from 'express';
import { loginSchema } from '../schemas/user.schema'; // your zod schema
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const parseResult = loginSchema.safeParse(req.body);
    console.log(`JWTsecret`, JWT_SECRET);

    if (!parseResult.success) {

        res.status(400).json({
            data: null,
            message: parseResult.error.flatten().fieldErrors
        });
        return
    }

    const { email, password } = parseResult.data;

    try {
        const user = await User.findOne({ email }).select('+hashedPassword');
        if (!user) {
            res.status(403).json({ message: 'Email or password is incorrect' });
            return
        }

        const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!passwordMatch) {
            res.status(403).json({ message: 'Email or password is incorrect' });
            return
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            token,
            user: {
                email: user.email,
                firstName: user.firstName
            }
        });
        return

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
        return
    }
});

export default router;
