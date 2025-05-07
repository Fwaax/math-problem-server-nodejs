import dotenv from 'dotenv';
dotenv.config(); // important: needs to be first line to read  otherwise all env variables will be undefined
import express from 'express';
// import mongoose from 'mongoose';
import authRouter from './controllers/auth.controller';
import userRouter from './controllers/user.controller';
import postRouter from './controllers/post.controller';
import cors from 'cors';

async function main() {
    try {
        const app = express();
        app.use(express.json());
        app.use(cors());
        app.use('/auth', authRouter);
        app.use('/user', userRouter);
        app.use('/post', postRouter);
        const port = process.env.PORT || 3000;
        app.listen(port, () => console.log(`Listening on http://localhost:${port}`));


    } catch (err) {
        console.error(`Failed to start server:`, err);
    }

}
main()