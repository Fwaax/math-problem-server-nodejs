import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_DB_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);



export type User = Database['public']['Tables']['users']['Row'];
export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type UpdateUser = Database['public']['Tables']['users']['Update'];


export type Post = Database['public']['Tables']['posts']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];




export default supabase;