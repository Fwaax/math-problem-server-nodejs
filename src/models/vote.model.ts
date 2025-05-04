import { Schema, model, Document, ObjectId, Types } from 'mongoose'

export interface IVote {
    votedBy: ObjectId;
    isUpvote: boolean;
    votedPost: ObjectId;
    // find all votes of post x then calc the sum
}

export interface IVoteDocument extends IVote, Document<Types.ObjectId> { }

const voteSchema = new Schema<IVoteDocument>({
    votedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isUpvote: { type: Boolean, required: true },
    votedPost: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

export default model<IVoteDocument>('Vote', voteSchema)