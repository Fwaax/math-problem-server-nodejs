
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { registerSchema, loginSchema } from '../schemas/user.schema';
import { generateToken } from '../utils/jwt.util';
import { IApiResponse } from '~/interfaces';
import { Router, Response, Request } from 'express';

const router = Router();

// POST /auth/register
router.post('/register', async (
    req: Request,
    res: Response<IApiResponse<string>>
): Promise<void> => {
    const parse = registerSchema.safeParse(req.body);

    if (!parse.success) {
        res.status(400).json({ data: null, message: parse.error.format().toString() });
        return; // Return early after sending the response
    }

    const { email, password, firstName, lastName, dateOfBirth } = parse.data;

    if (await User.findOne({ email })) {
        res.status(409).json({ data: null, message: 'User already exists' });
        return; // Return early after sending the response
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        email,
        hashedPassword,
        firstName,
        lastName,
        dateOfBirth,
    });

    res.status(201).json({ data: user.id, message: 'Registered' });
});

router.post('/login', async (
    req: Request,
    res: Response<IApiResponse<string>>
) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ data: null, message: parse.error.format().toString() });
        return
    }

    const { email, password } = parse.data;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
        res.status(401).json({ data: null, message: 'Invalid credentials' });
        return
    }

    const token = generateToken(user.id);
    res.json({ data: token, message: 'Loged in' });
});

export default router;
