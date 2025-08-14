import { createClient } from '@supabase/supabase-js';

/**
 * Admin client that bypasses RLS for approved users
 * This allows assistants to access numbercutter's data
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // This bypasses RLS
    
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}