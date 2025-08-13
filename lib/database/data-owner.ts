import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from './server-helpers';

/**
 * Configuration for data ownership
 * In your case, you are the primary data owner
 */
const PRIMARY_DATA_OWNER_EMAIL = 'numbercutter@protonmail.com'; // Your email

/**
 * Get the data owner's user ID - either the current user if they're the owner,
 * or the primary owner if the current user is an assistant
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

    // Otherwise, find the primary owner's user ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const primaryOwner = users?.users?.find((u: any) => u?.email === PRIMARY_DATA_OWNER_EMAIL);

    if (!primaryOwner) {
        throw new Error('Primary data owner not found');
    }

    // Check if current user has access to primary owner's data
    const { data: profile } = await supabase.from('user_profiles').select('preferences').eq('user_id', primaryOwner.id).single();

    const sharedAccess = (profile?.preferences as any)?.shared_access || [];
    const hasAccess = sharedAccess.some((access: any) => access.user_id === currentUserId);

    if (!hasAccess) {
        // If no access granted, return current user's ID (they'll see their own empty data)
        return currentUserId;
    }

    // Return primary owner's ID so assistant sees your data
    return primaryOwner.id;
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
    const currentUserId = await getCurrentUserId();
    const dataOwnerUserId = await getDataOwnerUserId();
    const isOwner = await isCurrentUserPrimaryOwner();

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return {
        isOwner,
        viewingOwnData: currentUserId === dataOwnerUserId,
        dataOwnerEmail: PRIMARY_DATA_OWNER_EMAIL,
        currentUserEmail: user?.email || '',
    };
}
