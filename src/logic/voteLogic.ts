import supabase from '~/utils/db';

/**
 * Casts a vote by a user for a post (replaces existing vote).
 * @param userId The ID of the user voting
 * @param postId The ID of the post being voted
 * @param isUpvote True if upvote, false if downvote
 */
export async function castVote(userId: string, postId: string, isUpvote: boolean) {
    try {
        // Delete existing vote if exists
        await supabase
            .from('votes')
            .delete()
            .eq('voted_by', userId)
            .eq('voted_post', postId);

        // Insert new vote
        const { error } = await supabase
            .from('votes')
            .insert({
                voted_by: userId,
                voted_post: postId,
                is_upvote: isUpvote
            });

        if (error) throw error;
    } catch (err) {
        console.error('Error casting vote:', err);
        throw err;
    }
}

/**
 * Counts upvotes and downvotes for a post.
 * @param postId The ID of the post
 * @returns An object { upvotes, downvotes }
 */
export async function countVotes(postId: string): Promise<{ upvotes: number; downvotes: number }> {
    try {
        const { data: upvotesData, error: upvoteError } = await supabase
            .from('votes')
            .select('id', { count: 'exact', head: false })
            .eq('voted_post', postId)
            .eq('is_upvote', true);

        const { data: downvotesData, error: downvoteError } = await supabase
            .from('votes')
            .select('id', { count: 'exact', head: false })
            .eq('voted_post', postId)
            .eq('is_upvote', false);

        if (upvoteError) throw upvoteError;
        if (downvoteError) throw downvoteError;

        return {
            upvotes: upvotesData?.length ?? 0,
            downvotes: downvotesData?.length ?? 0
        };
    } catch (err) {
        console.error('Error counting votes:', err);
        throw err;
    }
}

/**
 * Checks if the user has voted on a post.
 * @param userId The ID of the user
 * @param postId The ID of the post
 * @returns An object { voteObj } or null
 */
export async function hasUserVoted(userId: string, postId: string): Promise<{ voteObj: { is_upvote: boolean } | null }> {
    try {
        const { data, error } = await supabase
            .from('votes')
            .select('is_upvote')
            .eq('voted_by', userId)
            .eq('voted_post', postId)
            .limit(1);

        if (error) throw error;

        return { voteObj: data?.[0] ?? null };
    } catch (err) {
        console.error('Error checking user vote:', err);
        throw err;
    }
}