import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_DB_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;