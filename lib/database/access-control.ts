import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from './server-helpers';

export type AccessLevel = 'read' | 'write' | 'admin';

/**
 * Check if the current user can access another user's data
 */
export async function canAccessUserData(targetUserId: string, requiredLevel: AccessLevel = 'read'): Promise<boolean> {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return false;
    }

    // Users can always access their own data
    if (currentUserId === targetUserId) {
        return true;
    }

    const supabase = await createClient();

    // Check if the target user has granted access to the current user
    const { data: profile } = await supabase.from('user_profiles').select('preferences').eq('user_id', targetUserId).single();

    if (!profile?.preferences) {
        return false;
    }

    const sharedAccess = profile.preferences.shared_access as any[];
    if (!sharedAccess) {
        return false;
    }

    const accessRecord = sharedAccess.find((access) => access.user_id === currentUserId);

    if (!accessRecord) {
        return false;
    }

    // Check access level hierarchy: admin > write > read
    const levels = { read: 1, write: 2, admin: 3 };
    return levels[accessRecord.access_level] >= levels[requiredLevel];
}

/**
 * Get the effective user ID for data access
 * This allows assistants to access the owner's data when authorized
 */
export async function getEffectiveUserId(requestedUserId?: string): Promise<string> {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        throw new Error('User not authenticated');
    }

    // If no specific user requested, use current user
    if (!requestedUserId) {
        return currentUserId;
    }

    // Check if current user can access the requested user's data
    const canAccess = await canAccessUserData(requestedUserId);

    if (!canAccess) {
        throw new Error('Access denied to requested user data');
    }

    return requestedUserId;
}

/**
 * Grant access to another user
 */
export async function grantUserAccess(granteeEmail: string, accessLevel: AccessLevel = 'read'): Promise<{ success: boolean; message: string }> {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return { success: false, message: 'Not authenticated' };
    }

    const supabase = await createClient();

    // Find the grantee's user ID by email
    const { data: granteeUser } = await supabase.auth.admin.listUsers();
    const grantee = granteeUser.users.find((user) => user.email === granteeEmail);

    if (!grantee) {
        return { success: false, message: 'User not found with that email' };
    }

    // Get current user's profile
    const { data: profile } = await supabase.from('user_profiles').select('preferences').eq('user_id', currentUserId).single();

    const currentPreferences = profile?.preferences || {};
    const sharedAccess = (currentPreferences.shared_access as any[]) || [];

    // Remove existing access for this user if any
    const filteredAccess = sharedAccess.filter((access) => access.user_id !== grantee.id);

    // Add new access
    const newSharedAccess = [
        ...filteredAccess,
        {
            user_id: grantee.id,
            email: granteeEmail,
            access_level: accessLevel,
            granted_at: new Date().toISOString(),
        },
    ];

    const { error } = await supabase.from('user_profiles').upsert({
        user_id: currentUserId,
        preferences: {
            ...currentPreferences,
            shared_access: newSharedAccess,
        },
        updated_at: new Date().toISOString(),
    });

    if (error) {
        return { success: false, message: 'Failed to grant access' };
    }

    return { success: true, message: `Granted ${accessLevel} access to ${granteeEmail}` };
}

/**
 * Revoke access from another user
 */
export async function revokeUserAccess(granteeEmail: string): Promise<{ success: boolean; message: string }> {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return { success: false, message: 'Not authenticated' };
    }

    const supabase = await createClient();

    // Get current user's profile
    const { data: profile } = await supabase.from('user_profiles').select('preferences').eq('user_id', currentUserId).single();

    const currentPreferences = profile?.preferences || {};
    const sharedAccess = (currentPreferences.shared_access as any[]) || [];

    // Remove access for this user
    const filteredAccess = sharedAccess.filter((access) => access.email !== granteeEmail);

    const { error } = await supabase.from('user_profiles').upsert({
        user_id: currentUserId,
        preferences: {
            ...currentPreferences,
            shared_access: filteredAccess,
        },
        updated_at: new Date().toISOString(),
    });

    if (error) {
        return { success: false, message: 'Failed to revoke access' };
    }

    return { success: true, message: `Revoked access from ${granteeEmail}` };
}
