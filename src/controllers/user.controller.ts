import { Router, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { IApiResponse } from '~/interfaces';


const router = Router();

// GET /user/profile
router.get(
    '/profile',
    authMiddleware,
    async (
        req: AuthRequest,
        res: Response<IApiResponse<Omit<IUser, 'hashedPassword'>>>
    ) => {
        const user = await User.findById(req.userId).select('-hashedPassword');
        if (!user) {
            res.status(404).json({
                data: null,
                message: 'User not found',
            });
            return;
        }
        const userObj = user.toObject() as Omit<IUser, 'hashedPassword'>;
        res.json({
            data: userObj,
            message: 'User retrieved successfully',
        });
    }
);

export default router;
