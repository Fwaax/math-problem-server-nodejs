import { Schema, model, Document } from 'mongoose'

export interface IPost extends Document {
    title: string;
    uploader: string;
    date: Date;
    content: string; // Switch later suppose to be img
    answers: string; // Same as content -- img
    upvotes: number;
    downvotes: number;
    tag: string;
}

const postSchema = new Schema<IPost>({
    title: { type: String, required: true },
    uploader: { type: String },
    date: { type: Date },
    // content:{}
    // answers:{}
    upvotes: { type: Number },
    downvotes: { type: Number },
    tag: { type: String }
});

export default model<IPost>('Post', postSchema)


// Title, Uploader, Date, Content, Answers, Votes for answers 