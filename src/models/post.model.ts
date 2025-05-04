import { Schema, model, Document, Types } from 'mongoose';

export interface IPost {
    title: string;
    content: string;
    uploader: string;
    date: Date;
    tag: string;
}

export interface IPostDocument extends IPost, Document<Types.ObjectId> { }

const postSchema = new Schema<IPostDocument>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    uploader: { type: String, required: true },
    date: { type: Date, default: Date.now },
    tag: { type: String, required: true },
});

export default model<IPostDocument>('Post', postSchema);
