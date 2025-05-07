import { Router } from 'express';
import supabase from '../utils/db';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { UserSignupValidationZod } from '../validation/userValidation';

const router = Router();

// GET /user/profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, date_of_birth')
            .eq('id', req.userId)
            .limit(1);

        if (error) throw error;
        if (!users || users.length === 0) {
            res.status(404).json({ message: 'User not found', data: null });
            return;
        }

        const user = users[0];
        const validatedUser = UserSignupValidationZod.omit({ password: true }).parse(user);

        res.json({
            data: validatedUser,
            message: 'User retrieved successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve user', data: null });
    }
});

export default router;