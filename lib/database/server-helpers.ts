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
 * If user is an assistant, returns the primary owner's ID so they see owner's data
 */
export async function getDatabaseContext(): Promise<{
    supabase: Awaited<ReturnType<typeof createClient>>;
    userId: string;
}> {
    const supabase = await createClient();
    const { getDataOwnerUserId } = await import('./data-owner');
    const userId = await getDataOwnerUserId();

    return { supabase, userId };
}
