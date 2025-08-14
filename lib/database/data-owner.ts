import { createClient } from '@/lib/supabase/server';
import { isEmailApproved } from '@/lib/approved-emails';

const NUMBERCUTTER_EMAIL = 'numbercutter@protonmail.com';
const NUMBERCUTTER_USER_ID = '51812c6a-d469-4b9b-8f80-63c5539e79eb'; // From your user_profiles data

/**
 * SIMPLIFIED: Everyone sees numbercutter's data if they're approved
 */
export async function getDataOwnerUserId(): Promise<string> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        throw new Error('User email not found');
    }

    // Check if email is approved to access the app
    if (!isEmailApproved(user.email)) {
        throw new Error('Email not approved');
    }

    // EVERYONE sees numbercutter's data - no exceptions
    return NUMBERCUTTER_USER_ID;
}

/**
 * Check if the current user is the primary data owner
 */
export async function isCurrentUserPrimaryOwner(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === NUMBERCUTTER_EMAIL;
}

/**
 * SIMPLIFIED: Display context - everyone sees numbercutter's data
 */
export async function getDisplayContext(): Promise<{
    isOwner: boolean;
    viewingOwnData: boolean;
    dataOwnerEmail: string;
    currentUserEmail: string;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        throw new Error('Not authenticated');
    }

    const isOwner = user.email === NUMBERCUTTER_EMAIL;
    
    return {
        isOwner,
        viewingOwnData: isOwner, // Only numbercutter is viewing "own" data
        dataOwnerEmail: NUMBERCUTTER_EMAIL,
        currentUserEmail: user.email,
    };
}
