import { Router } from 'express';
import supabase from '../utils/db';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/posts?page=1&limit=10
router.get('/posts', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const offset = (page - 1) * limit;

        const { data: posts, error } = await supabase
            .from('posts')
            .select('id, title, content, uploader, date, tag')
            .order('date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        const { count, error: countError } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        const enrichedPosts = await Promise.all(posts.map(async post => {
            const { data: upvotesData } = await supabase
                .from('votes')
                .select('id')
                .eq('voted_post', post.id)
                .eq('is_upvote', true);
            const { data: downvotesData } = await supabase
                .from('votes')
                .select('id')
                .eq('voted_post', post.id)
                .eq('is_upvote', false);
            const { data: userVoteData } = await supabase
                .from('votes')
                .select('is_upvote')
                .eq('voted_post', post.id)
                .eq('voted_by', req.userId)
                .limit(1);

            return {
                ...post,
                upvotes: upvotesData?.length || 0,
                downvotes: downvotesData?.length || 0,
                userVote: userVoteData?.[0]?.is_upvote ?? null,
            };
        }));

        res.json({
            data: { page, limit, posts: enrichedPosts, totalCount: count },
            message: 'Posts fetched successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch posts', data: null });
    }
});

// GET /api/posts/:postId
router.get('/:postId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const postId = req.params.postId;

        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .limit(1);

        if (error) throw error;
        if (!posts || posts.length === 0) {
            res.status(404).json({ message: 'Post not found', data: null });
            return;
        }

        const post = posts[0];

        const { data: upvotesData } = await supabase
            .from('votes')
            .select('id')
            .eq('voted_post', postId)
            .eq('is_upvote', true);
        const { data: downvotesData } = await supabase
            .from('votes')
            .select('id')
            .eq('voted_post', postId)
            .eq('is_upvote', false);
        const { data: userVoteData } = await supabase
            .from('votes')
            .select('is_upvote')
            .eq('voted_post', postId)
            .eq('voted_by', req.userId)
            .limit(1);

        const enrichedPost = {
            ...post,
            upvotes: upvotesData?.length || 0,
            downvotes: downvotesData?.length || 0,
            userVote: userVoteData?.[0]?.is_upvote ?? null,
        };

        res.json({
            data: enrichedPost,
            message: 'Post fetched successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch post', data: null });
    }
});

// POST /api/posts/:postId/vote
router.post('/vote/:postId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const postId = req.params.postId;
        const { isUpvote } = req.body;

        if (typeof isUpvote !== 'boolean') {
            res.status(400).json({ message: 'isUpvote must be boolean', data: null });
            return;
        }

        // Delete existing vote
        await supabase
            .from('votes')
            .delete()
            .eq('voted_by', req.userId)
            .eq('voted_post', postId);

        // Insert new vote
        const { error } = await supabase
            .from('votes')
            .insert({ voted_by: req.userId, voted_post: postId, is_upvote: isUpvote });

        if (error) throw error;

        res.json({
            message: `Vote ${isUpvote ? 'upvoted' : 'downvoted'} successfully`,
            data: null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to cast vote', data: null });
    }
});

export default router;
