import { registerSchema, loginSchema } from "../schemas/user.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { DataContainedInToken } from "../interfaces";
import User from '../models/user.model'

const JWT_SECRET = process.env.JWT_SECRET;

export async function findUserByEmail(email: string) {
    const user = await User.findOne({ email: email.toLocaleLowerCase() });
    if (!user) {
        return null;
    }
    return user;
}

export async function addUserToDataBase(user: any) {
    const foundUserByEmail = await findUserByEmail(user.email);
    if (foundUserByEmail) {
        throw new Error(`User with email ${user.email} already exists.`);
    }
    user.email - user.email.toLowerCase();
    await User.create(user);
}

export async function findUserById(id: string) {
    const user = await User.findById({ id: id });
    if (!user) {
        return null;
    }
    return user;
}

export async function getLoginToken(email: string, password: string) {
    const foundUserByEmail = await User.findOne({ email }).select("+hashedPassword").exec();
    if (!foundUserByEmail) {
        throw new Error(`User not found.`);
    }
    const passwordMatch: boolean = await bcrypt.compare(password, foundUserByEmail.hashedPassword);
    if (!passwordMatch) {
        throw new Error(`Email or password is incorrect.`);
    }
    const objectTosign: DataContainedInToken = { id: foundUserByEmail._id.toString() };
    const token = jwt.sign({ id: foundUserByEmail._id }, JWT_SECRET, { expiresIn: "24h" });
    const userToReturn = {
        firstName: foundUserByEmail.firstName,
        email: foundUserByEmail.email,
    };
    return { token, user: userToReturn };
}
