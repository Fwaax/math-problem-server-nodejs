import supabase from '../utils/db';
import { User } from '../utils/db'; // Adjust import path as needed

export async function getUserByEmail(email: string) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) throw error;
    return data as User;
}

export async function createUser(user: Omit<User, 'id'>) {
    const { data, error } = await supabase.from('users').insert(user).select('*').single();
    if (error) throw error;
    return data as User;
}

export async function getUserById(id: string) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data as User;
}