import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { UserSignupValidationZod } from '../validation/userValidation';
import { getUserProfile } from '../repositories/db.repository';

const router = Router();

router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = await getUserProfile(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found', data: null });
            return;
        }
        const validatedUser = UserSignupValidationZod.omit({ password: true }).parse(user);
        res.json({ data: validatedUser, message: 'User retrieved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve user', data: null });
    }
});

export default router;