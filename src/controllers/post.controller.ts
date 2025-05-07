import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import {
    getPosts,
    getPostsCount,
    getPostById,
    countUpvotes,
    countDownvotes,
    getUserVote,
    castVote,
    getUsersCount,
    getRandomUser,
    createRandomPost,
    getPostsByUser,
    getPostsCountByUser
} from '../repositories/db.repository';

const router = Router();

router.get('/posts', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const offset = (page - 1) * limit;

        const posts = await getPosts(offset, limit);
        const count = await getPostsCount();

        const enrichedPosts = await Promise.all(posts.map(async post => ({
            ...post,
            upvotes: await countUpvotes(post.id),
            downvotes: await countDownvotes(post.id),
            userVote: await getUserVote(req.userId, post.id)
        })));

        res.json({
            data: { page, limit, posts: enrichedPosts, totalCount: count },
            message: 'Posts fetched successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch posts', data: null });
    }
});

router.get('/:postId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const postId = req.params.postId;
        const post = await getPostById(postId);

        if (!post) {
            res.status(404).json({ message: 'Post not found', data: null });
            return;
        }

        const enrichedPost = {
            ...post,
            upvotes: await countUpvotes(postId),
            downvotes: await countDownvotes(postId),
            userVote: await getUserVote(req.userId, postId)
        };

        res.json({ data: enrichedPost, message: 'Post fetched successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch post', data: null });
    }
});

router.post('/vote/:postId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const postId = req.params.postId;
        const { isUpvote } = req.body;

        if (typeof isUpvote !== 'boolean') {
            res.status(400).json({ message: 'isUpvote must be boolean', data: null });
            return;
        }

        await castVote(req.userId, postId, isUpvote);

        res.json({ message: `Vote ${isUpvote ? 'upvoted' : 'downvoted'} successfully`, data: null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to cast vote', data: null });
    }
});


// POST /api/debug/create-random-post
router.post('/debug/create-random-post', async (req: AuthRequest, res) => {
    try {
        const userCount = await getUsersCount();
        if (userCount === 0) {
            res.status(404).json({ message: 'No users in the database', data: null });
            return;
        }

        const randomIndex = Math.floor(Math.random() * userCount);
        const randomUser = await getRandomUser(randomIndex);

        if (!randomUser) {
            res.status(500).json({ message: 'Failed to fetch random user', data: null });
            return;
        }

        const newPost = await createRandomPost(randomUser.id);

        const enrichedPost = {
            ...newPost,
            upvotes: 0,
            downvotes: 0,
            userVote: null,
        };

        res.json({ message: 'Random post created successfully', data: enrichedPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create random post', data: null });
    }
});

// GET /api/posts/by-user/:userId
router.get('/posts/by-user/:userId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.params.userId;

        const userCount = await getUsersCount();
        const userExists = userCount > 0;
        if (!userExists) {
            res.status(404).json({ message: 'User not found', data: null });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const offset = (page - 1) * limit;

        const posts = await getPostsByUser(userId, offset, limit);
        const totalCount = await getPostsCountByUser(userId);

        const enrichedPosts = await Promise.all(posts.map(async post => ({
            ...post,
            upvotes: await countUpvotes(post.id),
            downvotes: await countDownvotes(post.id),
            userVote: await getUserVote(req.userId, post.id)
        })));

        res.json({
            message: 'Posts fetched successfully',
            data: { page, limit, posts: enrichedPosts, totalCount }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch posts', data: null });
    }
});

export default router;