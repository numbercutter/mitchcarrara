import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from './server-helpers';
import type { UserPreferences } from '@/database';

/**
 * Configuration for data ownership
 * In your case, you are the primary data owner
 */
const PRIMARY_DATA_OWNER_EMAIL = 'numbercutter@protonmail.com'; // Your email

/**
 * Get the primary owner's user ID from user_profiles table
 */
async function getPrimaryOwnerUserId(): Promise<string | null> {
    const supabase = await createClient();
    
    // Find the primary owner by looking for their profile with a special flag or by their known user_id
    // For now, we'll need to store the primary owner's user_id somewhere accessible
    // Let's check if there's a profile with the primary owner's email in the metadata
    const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, preferences')
        .not('preferences', 'is', null);

    // For now, return null and handle this case - we need the primary owner's user_id
    return null;
}

/**
 * Get the data owner's user ID - either the current user if they're the owner,
 * or the primary owner if the current user is an assistant with access
 */
export async function getDataOwnerUserId(): Promise<string> {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        throw new Error('User not authenticated');
    }

    const supabase = await createClient();

    // Get current user's email
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        throw new Error('User email not found');
    }

    // If current user is the primary owner, return their ID
    if (user.email === PRIMARY_DATA_OWNER_EMAIL) {
        return currentUserId;
    }

    // For assistants, we need to check if they have access to the primary owner's data
    // Since we can't easily get the primary owner's user_id without admin access,
    // let's implement a simpler approach: check if current user has a shared_access_to field
    const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', currentUserId)
        .single();

    const preferences = currentUserProfile?.preferences as UserPreferences;
    const hasSharedAccess = preferences?.shared_access_to; // If this user has access to someone else's data

    if (hasSharedAccess) {
        return hasSharedAccess as string; // Return the user ID they have access to
    }

    // Default: return current user's ID (they see their own data)
    return currentUserId;
}

/**
 * Check if the current user is the primary data owner
 */
export async function isCurrentUserPrimaryOwner(): Promise<boolean> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user?.email === PRIMARY_DATA_OWNER_EMAIL;
}

/**
 * Get display context for the current user
 */
export async function getDisplayContext(): Promise<{
    isOwner: boolean;
    viewingOwnData: boolean;
    dataOwnerEmail: string;
    currentUserEmail: string;
}> {
    try {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            throw new Error('Not authenticated');
        }

        const dataOwnerUserId = await getDataOwnerUserId();
        const isOwner = await isCurrentUserPrimaryOwner();

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const viewingOwnData = currentUserId === dataOwnerUserId;
        let dataOwnerEmail = PRIMARY_DATA_OWNER_EMAIL;

        // If viewing someone else's data, we might want to show their email
        // For now, we'll always show the primary owner's email as the "data source"
        if (!viewingOwnData) {
            dataOwnerEmail = PRIMARY_DATA_OWNER_EMAIL;
        } else if (isOwner) {
            dataOwnerEmail = user?.email || PRIMARY_DATA_OWNER_EMAIL;
        }

        return {
            isOwner,
            viewingOwnData,
            dataOwnerEmail,
            currentUserEmail: user?.email || '',
        };
    } catch (error) {
        console.error('Error in getDisplayContext:', error);
        // Return safe defaults
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        return {
            isOwner: user?.email === PRIMARY_DATA_OWNER_EMAIL,
            viewingOwnData: true,
            dataOwnerEmail: user?.email || '',
            currentUserEmail: user?.email || '',
        };
    }
}
