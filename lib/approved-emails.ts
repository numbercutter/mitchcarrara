import { createClient } from '@/lib/supabase/server';

// Simple list of approved emails that can access the dashboard
export const APPROVED_EMAILS = [
    'numbercutter@protonmail.com', // Main owner
    'jamlets@protonmail.com', // Assistant
    'amoyak333@gmail.com', // Shared access user
    'itch4224@gmail.com', // Shared access user
    // Add more emails here as needed
];

export function isEmailApproved(email: string): boolean {
    return APPROVED_EMAILS.includes(email.toLowerCase());
}

/**
 * Enhanced email approval that checks both static list and dynamic database shared access
 */
export async function isEmailApprovedAsync(email: string): Promise<boolean> {
    // First check static list for quick approval
    if (isEmailApproved(email)) {
        return true;
    }

    try {
        // Check if this email has been granted shared access in the database
        const supabase = await createClient();

        // Look for any user_profiles that have shared_access containing this email
        const { data: profiles } = await supabase.from('user_profiles').select('preferences').not('preferences', 'is', null);

        if (profiles) {
            for (const profile of profiles) {
                let preferences: any = {};
                try {
                    // Handle both string and object preferences
                    if (typeof profile.preferences === 'string') {
                        preferences = JSON.parse(profile.preferences);
                    } else {
                        preferences = profile.preferences;
                    }

                    const sharedAccess = preferences?.shared_access || [];
                    const hasAccess = sharedAccess.some((access: any) => access.email?.toLowerCase() === email.toLowerCase());

                    if (hasAccess) {
                        return true;
                    }
                } catch (parseError) {
                    // Skip invalid JSON
                    continue;
                }
            }
        }
    } catch (error) {
        console.error('Error checking database shared access:', error);
        // Fall back to static list on error
    }

    return false;
}
