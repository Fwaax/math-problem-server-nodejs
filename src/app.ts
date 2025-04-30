import dotenv from 'dotenv';
dotenv.config(); // important: needs to be first line to read  otherwise all env variables will be undefined
import express from 'express';
import mongoose from 'mongoose';
import authRouter from './controllers/auth.controller';
import userRouter from './controllers/user.controller';
import cors from 'cors';

async function main() {
    const app = express();
    app.use(express.json());
    app.use(cors());

    mongoose.connect(process.env.DB_CONNECTION_URL);

    app.use('/auth', authRouter);
    app.use('/user', userRouter);

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
}
main()