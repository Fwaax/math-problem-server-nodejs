import supabase from '../utils/db';
import bcrypt from 'bcrypt';

/**
 * Adds a user to the database (if not exists).
 * @param user The user object (expects: email, first_name, last_name, password, date_of_birth)
 */
export async function addUserToDatabase(user: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    date_of_birth: number;
}) {
    try {
        // Check if user already exists
        const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .limit(1);

        if (selectError) throw selectError;

        if (existingUser && existingUser.length > 0) {
            console.log(`User already exists with email ${user.email}`);
            return existingUser[0];
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insert new user
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

        console.log(`User created with ID: ${newUser.id}`);
        return newUser;
    } catch (err) {
        console.error('Error adding user to database:', err);
        throw err;
    }
}