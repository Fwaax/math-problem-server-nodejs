import { Router, Response } from 'express';
import { Types } from 'mongoose';
import PostModel, { IPost, IPostDocument } from '../models/post.model';
import { castVote, countVotes, hasUserVoted } from '../logic/voteLogic';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { IApiResponse } from '../interfaces';
import { faker } from '@faker-js/faker';
import UserModel from '../models/user.model';

interface EnrichedPost {
    _id: Types.ObjectId;
    title: string;
    content: string;
    uploader: string;
    date: Date;
    tag: string;
    upvotes: number;
    downvotes: number;
    userVote: boolean | null;
}

const router = Router();

// GET /api/posts?page=1&limit=10
router.get(
    '/posts',
    authMiddleware,
    async (req: AuthRequest, res: Response<IApiResponse<{ page: number; limit: number; posts: EnrichedPost[]; totalCount: number }>>) => {
        try {
            // Limit the maximum number of posts requested to 50
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 50);  // Max limit is 50
            const skip = (page - 1) * limit;

            // Fetch posts from the database
            const posts: IPostDocument[] = await PostModel.find()
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);

            // Fetch total count for pagination purposes
            const totalCount = await PostModel.countDocuments();

            // Enrich the posts with vote data
            const enrichedPosts: EnrichedPost[] = await Promise.all(
                posts.map(async (post) => {
                    const voteSummary = await countVotes(post._id);
                    const { voteObj } = await hasUserVoted(new Types.ObjectId(req.userId), post._id);

                    return {
                        _id: post._id,
                        title: post.title,
                        content: post.content,
                        uploader: post.uploader,
                        date: post.date,
                        tag: post.tag,
                        upvotes: voteSummary.upvotes,
                        downvotes: voteSummary.downvotes,
                        userVote: voteObj ? voteObj.isUpvote : null,
                    };
                })
            );

            // Return the response with pagination data
            res.json({
                data: {
                    page,
                    limit,
                    posts: enrichedPosts,
                    totalCount,  // Total number of posts for pagination
                },
                message: 'Posts fetched successfully',
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch posts', data: null });
        }
    }
);


// GET /api/posts/:postId
router.get(
    '/:postId',
    authMiddleware,
    async (req: AuthRequest, res: Response<IApiResponse<EnrichedPost>>) => {
        try {
            const postId = req.params.postId;
            const post = await PostModel.findById(postId);

            if (!post) {
                res.status(404).json({ message: 'Post not found', data: null });
                return
            }

            const voteSummary = await countVotes(post._id);
            const { voteObj } = await hasUserVoted(new Types.ObjectId(req.userId), post._id);

            const enrichedPost: EnrichedPost = {
                _id: post._id,
                title: post.title,
                content: post.content,
                uploader: post.uploader,
                date: post.date,
                tag: post.tag,
                upvotes: voteSummary.upvotes,
                downvotes: voteSummary.downvotes,
                userVote: voteObj ? voteObj.isUpvote : null,
            };

            res.json({
                data: enrichedPost,
                message: 'Post fetched successfully',
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch post', data: null });
        }
    }
);


// POST /api/posts/:postId/vote
router.post(
    '/vote/:postId',
    authMiddleware,
    async (req: AuthRequest, res: Response<IApiResponse<null>>) => {
        try {
            const postId = req.params.postId;
            const { isUpvote } = req.body;

            if (typeof isUpvote !== 'boolean') {
                res.status(400).json({ message: 'isUpvote must be a boolean', data: null });
                return
            }

            await castVote(new Types.ObjectId(req.userId), new Types.ObjectId(postId), isUpvote);

            res.json({
                message: `Vote ${isUpvote ? 'upvoted' : 'downvoted'} successfully`,
                data: null,
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to cast vote', data: null });
        }
    }
);

// POST /api/debug/create-random-post
router.post(
    '/debug/create-random-post',
    async (req: AuthRequest, res: Response<IApiResponse<EnrichedPost>>) => {
        try {
            const userCount = await UserModel.countDocuments();
            if (userCount === 0) {
                res.status(404).json({ message: 'No users in the database', data: null });
                return
            }

            const randomIndex = Math.floor(Math.random() * userCount);
            const randomUser = await UserModel.findOne().skip(randomIndex);

            if (!randomUser) {
                res.status(500).json({ message: 'Failed to fetch random user', data: null });
                return
            }

            const newPost = await PostModel.create({
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraphs(2),
                uploader: randomUser.email,
                date: new Date(),
                tag: faker.hacker.noun(),
            });

            const enrichedPost: EnrichedPost = {
                _id: newPost._id,
                title: newPost.title,
                content: newPost.content,
                uploader: newPost.uploader,
                date: newPost.date,
                tag: newPost.tag,
                upvotes: 0,
                downvotes: 0,
                userVote: null,
            };

            res.json({
                message: 'Random post created successfully',
                data: enrichedPost,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to create random post', data: null });
        }
    }
);

// Endpoint to get the posts of a specific user with pagination
router.get(
    '/posts/:userId',
    authMiddleware,
    async (req: AuthRequest, res: Response<IApiResponse<{
        page: number;
        limit: number;
        posts: EnrichedPost[];
        totalCount: number;
    }>>) => {
        try {
            const userId = req.params.userId;
            const user = await UserModel.findById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found', data: null });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max 50
            const skip = (page - 1) * limit;

            const posts = await PostModel.find({ uploader: user.email })
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);

            const totalCount = await PostModel.countDocuments({ uploader: user.email });

            const enrichedPosts: EnrichedPost[] = await Promise.all(
                posts.map(async (post) => {
                    const voteSummary = await countVotes(post._id);
                    const { voteObj } = await hasUserVoted(new Types.ObjectId(req.userId), post._id);

                    return {
                        _id: post._id,
                        title: post.title,
                        content: post.content,
                        uploader: post.uploader,
                        date: post.date,
                        tag: post.tag,
                        upvotes: voteSummary.upvotes,
                        downvotes: voteSummary.downvotes,
                        userVote: voteObj ? voteObj.isUpvote : null,
                    };
                })
            );

            res.json({
                message: 'Posts fetched successfully',
                data: {
                    page,
                    limit,
                    posts: enrichedPosts,
                    totalCount,
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch posts', data: null });
        }
    }
);



export default router;