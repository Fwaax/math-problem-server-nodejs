import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import * as RepoUser from '../repositories/user.repository';

const router = Router();

router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = await RepoUser.getUserById(req.userId);
        if (!user) {
            res.status(404).json({ data: null, message: 'User not found' });
            return;
        }
        res.json({ data: user, message: 'User profile retrieved successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: 'Error retrieving user profile' });
    }
});

export default router;