import { Types } from 'mongoose';
import Vote, { IVote } from '../models/vote.model';

export const hasUserVoted = async (
    userId: Types.ObjectId,
    postId: Types.ObjectId
): Promise<{ isExist: boolean; voteObj: IVote | null }> => {
    const vote = await Vote.findOne({ votedBy: userId, votedPost: postId });
    return {
        isExist: !!vote,
        voteObj: vote,
    };
};

export const castVote = async (
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    isUpvote: boolean
): Promise<void> => {
    const existingVote = await Vote.findOne({ votedBy: userId, votedPost: postId });

    if (existingVote) {
        existingVote.isUpvote = isUpvote;
        await existingVote.save();
    } else {
        await Vote.create({
            votedBy: userId,
            votedPost: postId,
            isUpvote,
        });
    }
};


export const countVotes = async (
    postId: Types.ObjectId
): Promise<{ upvotes: number; downvotes: number }> => {
    // Step 1: Match all votes for the given post
    const groupedVotes = await Vote.aggregate([
        { $match: { votedPost: postId } },
        {
            $group: {
                _id: '$isUpvote',     // Group by isUpvote: true or false
                count: { $sum: 1 },   // Count how many votes per group
            },
        },
    ]);

    // Step 2: Initialize counters
    let upvoteCount = 0;
    let downvoteCount = 0;

    // Step 3: Assign the grouped values to upvotes and downvotes
    for (const voteGroup of groupedVotes) {
        const isUpvote = voteGroup._id;
        const count = voteGroup.count;

        if (isUpvote === true) {
            upvoteCount = count;
        } else if (isUpvote === false) {
            downvoteCount = count;
        }
    }

    // Step 4: Return the result
    return {
        upvotes: upvoteCount,
        downvotes: downvoteCount,
    };
};

