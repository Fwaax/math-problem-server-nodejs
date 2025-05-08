import supabase from '../utils/db';
import { Post } from '../utils/db'; // Adjust import path

export async function getAllPosts() {
    const { data, error } = await supabase.from('posts').select('*');
    if (error) throw error;
    return data as Post[];
}

export async function getPostById(id: string) {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Post;
}

export async function createPost(post: Omit<Post, 'id'>) {
    const { data, error } = await supabase.from('posts').insert(post).select('*').single();
    if (error) throw error;
    return data as Post;
}

export async function getPosts(offset: number, limit: number) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getPostsCount() {
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
}

export async function getPostsByUser(userId: string, offset: number, limit: number) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('uploader', userId)
        .range(offset, offset + limit - 1)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getPostsCountByUser(userId: string) {
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('uploader', userId);

    if (error) throw error;
    return count || 0;
}

export async function getRandomUser() {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .order('random()')
        .limit(1)
        .single();

    if (error) throw error;
    return data;
}

export async function createRandomPost(post: Omit<Post, 'id'>) {
    const { data, error } = await supabase.from('posts').insert(post).select('*').single();
    if (error) throw error;
    return data;
}