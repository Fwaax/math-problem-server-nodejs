import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import * as RepoPost from '../repositories/post.repository';
import * as RepoVote from '../repositories/vote.repository';
import { faker } from '@faker-js/faker/.';

const router = Router();

router.get('/posts', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const offset = (page - 1) * limit;

        const posts = await RepoPost.getPosts(offset, limit);
        const count = await RepoPost.getPostsCount();

        const postIds = posts.map(p => p.id);
        const voteCounts = await RepoVote.getVoteCountsForPosts(postIds);
        const userVotes = await RepoVote.getUserVotesForPosts(postIds, req.userId);

        const enrichedPosts = posts.map(post => ({
            ...post,
            upvotes: voteCounts[post.id]?.upvotes || 0,
            downvotes: voteCounts[post.id]?.downvotes || 0,
            userVote: userVotes[post.id] ?? null
        }));

        res.json({ data: { posts: enrichedPosts, count }, message: 'Posts retrieved successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: 'Error retrieving posts' });
    }
});

router.get('/posts/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const post = await RepoPost.getPostById(req.params.id);
        if (!post) {
            res.status(404).json({ data: null, message: 'Post not found' });
            return;
        }
        const voteCounts = await RepoVote.getVoteCountsForPosts([post.id]);
        const userVote = await RepoVote.getUserVotesForPosts([post.id], req.userId);

        res.json({
            data: {
                ...post,
                upvotes: voteCounts[post.id]?.upvotes || 0,
                downvotes: voteCounts[post.id]?.downvotes || 0,
                userVote: userVote[post.id] ?? null
            },
            message: 'Post retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({ data: null, message: 'Error retrieving post' });
    }
});

router.get('/posts/user/:userId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const offset = (page - 1) * limit;

        const posts = await RepoPost.getPostsByUser(req.params.userId, offset, limit);
        const count = await RepoPost.getPostsCountByUser(req.params.userId);

        res.json({ data: { posts, count }, message: 'User posts retrieved successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: 'Error retrieving user posts' });
    }
});

router.get('/posts/random', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = await RepoPost.getRandomUser();
        if (!user) {
            res.status(404).json({ data: null, message: 'No users found to assign post' });
            return;
        }

        const posts = await RepoPost.getPostsByUser(user.id, 0, 1);
        if (posts.length === 0) {
            res.status(404).json({ data: null, message: 'No posts found for random user' });
            return;
        }

        res.json({ data: posts[0], message: 'Random post retrieved successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: 'Error retrieving random post' });
    }
});

router.post('/posts/random/create', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = await RepoPost.getRandomUser();
        if (!user) {
            res.status(404).json({ data: null, message: 'No users available to assign post' });
            return;
        }

        const randomTitle = faker.lorem.sentence(5);
        const randomContent = faker.lorem.paragraphs(2);
        const randomTag = faker.helpers.arrayElement(['tech', 'life', 'fun', 'education', 'random']);
        const date = new Date().toISOString(); // ✅ add date explicitly

        const post = await RepoPost.createRandomPost({
            title: randomTitle,
            content: randomContent,
            tag: randomTag,
            uploader: user.id,
            date // ✅ pass date explicitly
        });

        res.json({ data: post, message: 'Random post created successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: 'Error creating random post' });
    }
});

export default router;