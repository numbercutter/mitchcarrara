import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

/**
 * Get the current user ID from Supabase auth
 */
export async function getCurrentUserId(): Promise<string | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
}

/**
 * Check if user is authenticated via Supabase
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        const userId = await getCurrentUserId();
        return userId !== null;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

/**
 * Simplified database context for personal dashboard pages
 * Returns Supabase client and the appropriate user ID for data access
 * Uses admin client for assistants to bypass RLS
 */
export async function getDatabaseContext(): Promise<{
    supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof import('../supabase/admin-client').createAdminClient>;
    userId: string;
}> {
    const { getDataOwnerUserId, isCurrentUserPrimaryOwner } = await import('./data-owner');
    const userId = await getDataOwnerUserId();
    const isOwner = await isCurrentUserPrimaryOwner();
    
    if (isOwner) {
        // Owner uses regular client (respects RLS)
        const supabase = await createClient();
        return { supabase, userId };
    } else {
        // Assistants use admin client (bypasses RLS)
        const { createAdminClient } = await import('../supabase/admin-client');
        const supabase = createAdminClient();
        return { supabase, userId };
    }
}
