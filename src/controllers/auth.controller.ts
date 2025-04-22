import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { registerSchema, loginSchema } from '../schemas/user.schema';
import { generateToken } from '../utils/jwt.util';

const router = Router();

// POST /auth/register
router.post('/register', async (req, res) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error.format());

    const { email, password, firstName, lastName, dateOfBirth } = parse.data;
    if (await User.findOne({ email })) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        email,
        hashedPassword,
        firstName,
        lastName,
        dateOfBirth,
    });

    res.status(201).json({ id: user.id });
});

router.post('/login', async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error.format());

    const { email, password } = parse.data;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({ token });
});

export default router;
