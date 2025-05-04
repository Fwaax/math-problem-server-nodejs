import { Schema, model, Document, Types } from 'mongoose';

export interface IUser {
    firstName: string;
    lastName: string;
    dateOfBirth: number;
    email: string;
    hashedPassword: string;
}

export interface IUserDocument extends IUser, Document<Types.ObjectId> { }

const userSchema = new Schema<IUserDocument>({
    firstName: { type: String, default: 'John' },
    lastName: { type: String, default: 'Doe' },
    dateOfBirth: { type: Number, default: 0 },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true, select: false },
});

export default model<IUserDocument>('User', userSchema);