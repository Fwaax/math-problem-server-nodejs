import express from 'express';
import { loginSchema, registerSchema } from '../schemas/user.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as RepoUser from '../repositories/user.repository';
import { F } from '@faker-js/faker/dist/airline-BUL6NtOJ';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        const parseResult = loginSchema.safeParse(req.body);

        if (!parseResult.success) {
            res.status(400).json({ data: null, message: 'Invalid input' });
            return;
        }

        const { email, password } = parseResult.data;
        const user = await RepoUser.getUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
            res.status(401).json({ data: null, message: 'Invalid credentials' });
            return;
        }

        const objToSign = { id: user.id, userFirstName: user.first_name, userEmail: user.email };
        const token = jwt.sign(objToSign, JWT_SECRET!, { expiresIn: '1h' });

        res.json({
            data: token,
            message: 'Login successful'
        });

    } catch (error) {
        res.status(500).json({ data: null, message: 'Error logging in' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const parseResult = registerSchema.safeParse(req.body);

        if (!parseResult.success) {
            res.status(400).json({ data: null, message: 'Invalid input' });
            return;
        }

        const { email, password, firstName, lastName, dateOfBirth } = parseResult.data;
        const existingUser = await RepoUser.getUserByEmail(email);

        if (existingUser) {
            res.status(409).json({ data: null, message: 'User already exists' });
            return;
        }

        const hashed_password = await bcrypt.hash(password, 10);
        const user = await RepoUser.createUser({
            email,
            hashed_password,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth
        });

        res.json({ data: user, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: 'Error registering user' });
    }
});

export default router;