import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/database/server-helpers';
import { getDataOwnerUserId, getDisplayContext } from '@/lib/database/data-owner';
import type { UserPreferences } from '@/database';

export async function GET() {
    try {
        const supabase = await createClient();
        const currentUserId = await getCurrentUserId();
        
        if (!currentUserId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUserId)
            .single();

        const dataOwnerUserId = await getDataOwnerUserId();
        const displayContext = await getDisplayContext();

        return NextResponse.json({
            current_user: {
                id: currentUserId,
                email: user?.email
            },
            profile: profile || null,
            profile_error: profileError?.message || null,
            data_owner_user_id: dataOwnerUserId,
            display_context: displayContext,
            should_see_owners_data: currentUserId !== dataOwnerUserId
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({ 
            error: 'Debug failed', 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}