import supabase from '../utils/db';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker'; // add faker if needed

/** USER QUERIES **/
export async function getUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, date_of_birth')
        .eq('id', userId)
        .limit(1);
    if (error) throw error;
    return data?.[0] ?? null;
}

export async function getUserByEmail(email: string) {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, hashed_password, first_name')
        .eq('email', email)
        .limit(1);
    if (error) throw error;
    return data?.[0] ?? null;
}

export async function addUser(user: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    date_of_birth: number;
}): Promise<{ user: any; alreadyExists: boolean }> {
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .limit(1);

    if (selectError) throw selectError;

    if (existingUser && existingUser.length > 0) {
        return { user: existingUser[0], alreadyExists: true };
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            date_of_birth: user.date_of_birth,
            hashed_password: hashedPassword
        })
        .select('id')
        .single();

    if (insertError) throw insertError;

    return { user: newUser, alreadyExists: false };
}

/** POST QUERIES **/
export async function getPosts(offset: number, limit: number) {
    const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, uploader, date, tag')
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
}

export async function getPostsCount() {
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
}

export async function getPostById(postId: string) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .limit(1);
    if (error) throw error;
    return data?.[0] ?? null;
}

/** VOTE QUERIES **/
export async function countUpvotes(postId: string) {
    const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('voted_post', postId)
        .eq('is_upvote', true);
    if (error) throw error;
    return data?.length ?? 0;
}

export async function countDownvotes(postId: string) {
    const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('voted_post', postId)
        .eq('is_upvote', false);
    if (error) throw error;
    return data?.length ?? 0;
}

export async function getUserVote(userId: string, postId: string) {
    const { data, error } = await supabase
        .from('votes')
        .select('is_upvote')
        .eq('voted_by', userId)
        .eq('voted_post', postId)
        .limit(1);
    if (error) throw error;
    return data?.[0]?.is_upvote ?? null;
}

export async function castVote(userId: string, postId: string, isUpvote: boolean) {
    await supabase.from('votes').delete().eq('voted_by', userId).eq('voted_post', postId);
    const { error } = await supabase
        .from('votes')
        .insert({ voted_by: userId, voted_post: postId, is_upvote: isUpvote });
    if (error) throw error;
}


/** Returns total user count */
export async function getUsersCount(): Promise<number> {
    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
}

/** Gets a random user by index */
export async function getRandomUser(skipIndex: number) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .range(skipIndex, skipIndex);
    if (error) throw error;
    return data?.[0] ?? null;
}

/** Creates a random post */
export async function createRandomPost(userId: string) {
    const newPost = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        uploader: userId,
        date: new Date().toISOString(),
        tag: faker.hacker.noun(),
    };

    const { data, error } = await supabase
        .from('posts')
        .insert(newPost)
        .select('*')
        .single();
    if (error) throw error;
    return data;
}

/** Get posts by userId with pagination */
export async function getPostsByUser(userId: string, offset: number, limit: number) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('uploader', userId)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
}

/** Get count of posts by userId */
export async function getPostsCountByUser(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('uploader', userId);
    if (error) throw error;
    return count ?? 0;
}