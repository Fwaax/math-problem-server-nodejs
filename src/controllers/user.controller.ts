import { Router, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { IApiResponse } from '~/interfaces';
import { UserSignupValidationZod, LoginValidationZod } from '../validation/userValidation';
import { addUserToDataBase } from '../logic/index';

const router = Router();

// GET /user/profile
router.get(
    '/profile',
    authMiddleware,
    async (
        req: AuthRequest,
        res: Response<IApiResponse<Omit<IUser, 'hashedPassword'>>>
    ) => {
        const userInput = UserSignupValidationZod.strict().parse(req.body);

        // Safe version to return (no password)
        const userToReturn = UserSignupValidationZod.omit({ password: true }).parse(userInput);

        if (!userToReturn) {
            res.status(404).json({
                data: null,
                message: 'User not found',
            });
            return;
        }
        const userObj = userToReturn as Omit<IUser, 'hashedPassword'>;
        await addUserToDataBase(userObj);
        res.json({
            data: userObj,
            message: 'User retrieved successfully',
        });
    }
);

export default router;
