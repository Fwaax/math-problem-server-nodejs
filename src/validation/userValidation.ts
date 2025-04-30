import { z } from "zod";
import mongoose from "mongoose";

export const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=(?:.*[A-Z]){3})(?=(?:.*[a-z]){3})(?=(?:.*\d){1})(?=(?:.*[!@#$%^&*]){1}).*$/;

// Custom validation for ObjectId
const objectIdSchema = z.any().refine((val) => val instanceof mongoose.Types.ObjectId, {
    message: "Invalid ObjectId",
});

export const UserSignupValidationZod = z.object({
    email: z.string().email().regex(EMAIL_REGEX, { message: "Invalid email format" }),
    password: z.string().min(8).max(20).regex(PASSWORD_REGEX, { message: "Password does not meet complexity requirements" }),
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
});

export const LoginValidationZod = z.object({
    email: z.string().email().regex(EMAIL_REGEX, { message: "Invalid email format" }),
    password: z.string().min(7).max(20).regex(PASSWORD_REGEX, { message: "Password does not meet complexity requirements" }),
});
