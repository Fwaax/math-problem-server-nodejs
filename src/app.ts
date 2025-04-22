import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './controllers/auth.controller';
import userRouter from './controllers/user.controller';


async function main() {
    dotenv.config();
    const app = express();
    app.use(express.json());

    mongoose.connect(process.env.MONGO_URI!);

    app.use('/auth', authRouter);
    app.use('/user', userRouter);

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
}
main()