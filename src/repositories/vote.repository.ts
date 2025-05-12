import supabase from '../utils/db';
import { Vote } from '../utils/db'; // Adjust import path


export async function getVotesForPost(postId: string) {
    const { data, error } = await supabase.from('votes').select('*').eq('voted_post', postId);
    if (error) throw error;
    return data as Vote[];
}

export async function getUserVoteForPost(userId: string, postId: string) {
    const { data, error } = await supabase.from('votes').select('*').eq('voted_by', userId).eq('voted_post', postId).single();
    if (error) throw error;
    return data as Vote;
}

export async function addVote(vote: Omit<Vote, 'id'>) {
    const { data, error } = await supabase.from('votes').insert(vote).select('*').single();
    if (error) throw error;
    return data as Vote;
}

export async function deleteVote(voteId: string) {
    const { error } = await supabase.from('votes').delete().eq('id', voteId);
    if (error) throw error;
}



export async function getVoteCountsForPosts(postIds: string[]) {
    const { data, error } = await supabase
        .from('votes')
        .select('voted_post, is_upvote')
        .in('voted_post', postIds);

    if (error) throw error;

    const result: Record<string, { upvotes: number; downvotes: number }> = {};
    postIds.forEach(id => {
        result[id] = { upvotes: 0, downvotes: 0 };
    });

    data.forEach(row => {
        if (row.is_upvote) {
            result[row.voted_post].upvotes++;
        } else {
            result[row.voted_post].downvotes++;
        }
    });

    return result;
}


export async function getUserVotesForPosts(postIds: string[], userId: string) {
    const { data, error } = await supabase
        .from('votes')
        .select('voted_post, is_upvote')
        .in('voted_post', postIds)
        .eq('voted_by', userId);

    if (error) throw error;

    const result: Record<string, boolean> = {};
    data.forEach(row => result[row.voted_post] = row.is_upvote);
    return result;
}