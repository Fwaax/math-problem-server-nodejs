import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    dateOfBirth: number;
    email: string;
    hashedPassword: string;
}

const userSchema = new Schema<IUser>({
    firstName: { type: String, default: 'John' },
    lastName: { type: String, default: 'Doe' },
    dateOfBirth: { type: Number, default: 0 },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
});

export default model<IUser>('User', userSchema);
