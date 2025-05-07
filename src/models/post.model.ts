import { Schema, model, Document, Types } from 'mongoose';
import supabase from '~/utils/db';
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


// src/migrations/initTables.ts


const createTablesSQL = `
create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    first_name text default 'John',
    last_name text default 'Doe',
    date_of_birth bigint default 0,
    email text not null unique,
    hashed_password text not null
);

create table if not exists posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    uploader uuid not null references users(id) on delete cascade,
    date timestamp with time zone default now(),
    tag text not null
);

create table if not exists votes (
    id uuid primary key default gen_random_uuid(),
    voted_by uuid not null references users(id) on delete cascade,
    is_upvote boolean not null,
    voted_post uuid not null references posts(id) on delete cascade
);
`;

export async function initializeTables() {
    const { error } = await supabase.rpc('execute_sql', { sql: createTablesSQL });
    if (error) {
        console.error('Error initializing tables:', error);
    } else {
        console.log('Tables initialized or already exist');
    }
}