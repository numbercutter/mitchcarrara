import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        
        // Check if user_profiles table exists and what's in it
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(10);

        // Get current user for reference
        const { data: { user } } = await supabase.auth.getUser();
        
        return NextResponse.json({
            current_user_email: user?.email,
            profiles_data: profiles,
            profiles_error: profilesError?.message || null,
            profiles_count: profiles?.length || 0
        });
    } catch (error) {
        console.error('Debug DB error:', error);
        return NextResponse.json({ 
            error: 'Debug DB failed', 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}