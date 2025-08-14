import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/database/server-helpers';
import type { UserPreferences } from '@/database';

const PRIMARY_DATA_OWNER_EMAIL = 'numbercutter@protonmail.com';

// GET - List users who have access to current user's data
export async function GET() {
    try {
        const supabase = await createClient();
        const currentUserId = await getCurrentUserId();

        if (!currentUserId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Only primary owner can view shared access list
        if (user?.email !== PRIMARY_DATA_OWNER_EMAIL) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { data: profile } = await supabase.from('user_profiles').select('preferences').eq('user_id', currentUserId).single();

        let sharedAccess = [];
        if (profile?.preferences) {
            try {
                // Parse JSON string preferences
                const prefsString = typeof profile.preferences === 'string' ? profile.preferences : JSON.stringify(profile.preferences);
                const preferences: any = JSON.parse(prefsString);
                sharedAccess = preferences?.shared_access || [];
            } catch (parseError) {
                console.error('Error parsing preferences:', parseError);
            }
        }

        return NextResponse.json({ shared_access: sharedAccess });
    } catch (error) {
        console.error('Error getting shared access:', error);
        return NextResponse.json({ error: 'Failed to get shared access' }, { status: 500 });
    }
}

// POST - Grant access to a user by email
export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const currentUserId = await getCurrentUserId();

        if (!currentUserId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Only primary owner can grant access
        if (user?.email !== PRIMARY_DATA_OWNER_EMAIL) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // First, find the user with this email by checking their auth record
        // We'll need to do this by having them sign up first, then we can find their user_id

        // For now, let's check if there's a user_profiles record for someone with this email
        // This is a limitation - we need the user to have logged in at least once

        // Alternative approach: Store the email and when they log in, set up the shared access

        // Get current user's profile
        const { data: currentProfile, error: profileError } = await supabase.from('user_profiles').select('preferences').eq('user_id', currentUserId).single();

        if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 = no rows found
            throw profileError;
        }

        // Parse existing preferences
        let preferences: any = {};
        let sharedAccess = [];

        if (currentProfile?.preferences) {
            try {
                const prefsString = typeof currentProfile.preferences === 'string' ? currentProfile.preferences : JSON.stringify(currentProfile.preferences);
                preferences = JSON.parse(prefsString);
                sharedAccess = preferences.shared_access || [];
            } catch (parseError) {
                console.error('Error parsing existing preferences:', parseError);
            }
        }

        // Check if access already granted
        const existingAccess = sharedAccess.find((access) => access.email === email);
        if (existingAccess) {
            return NextResponse.json({ message: 'Access already granted to this user' });
        }

        // Add the email to shared access (we'll resolve the user_id when they log in)
        sharedAccess.push({
            user_id: '', // Will be filled in when user logs in
            email,
            granted_at: new Date().toISOString(),
            permissions: ['view'],
        });

        const updatedPreferences = {
            ...preferences,
            shared_access: sharedAccess,
        };

        // Update profile with JSON string
        const { error: updateError } = await supabase.from('user_profiles').upsert({
            user_id: currentUserId,
            preferences: JSON.stringify(updatedPreferences),
        });

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            message: `Access granted to ${email}`,
            shared_access: sharedAccess,
        });
    } catch (error) {
        console.error('Error granting access:', error);
        return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 });
    }
}

// DELETE - Revoke access from a user
export async function DELETE(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const currentUserId = await getCurrentUserId();

        if (!currentUserId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Only primary owner can revoke access
        if (user?.email !== PRIMARY_DATA_OWNER_EMAIL) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Get current user's profile
        const { data: currentProfile } = await supabase.from('user_profiles').select('preferences').eq('user_id', currentUserId).single();

        // Parse existing preferences
        let preferences: any = {};
        let sharedAccess = [];

        if (currentProfile?.preferences) {
            try {
                const prefsString = typeof currentProfile.preferences === 'string' ? currentProfile.preferences : JSON.stringify(currentProfile.preferences);
                preferences = JSON.parse(prefsString);
                sharedAccess = preferences.shared_access || [];
            } catch (parseError) {
                console.error('Error parsing existing preferences:', parseError);
            }
        }

        // Remove the email from shared access
        const updatedSharedAccess = sharedAccess.filter((access) => access.email !== email);

        const updatedPreferences = {
            ...preferences,
            shared_access: updatedSharedAccess,
        };

        // Update profile with JSON string
        const { error: updateError } = await supabase.from('user_profiles').upsert({
            user_id: currentUserId,
            preferences: JSON.stringify(updatedPreferences),
        });

        if (updateError) {
            throw updateError;
        }

        // Also revoke their shared_access_to if they had it
        const { error: revokeError } = await supabase
            .from('user_profiles')
            .update({
                preferences: {
                    shared_access_to: null,
                },
            })
            .contains('preferences', { shared_access_to: currentUserId });

        return NextResponse.json({
            message: `Access revoked from ${email}`,
            shared_access: updatedSharedAccess,
        });
    } catch (error) {
        console.error('Error revoking access:', error);
        return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
    }
}
