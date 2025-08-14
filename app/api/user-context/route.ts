import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PRIMARY_DATA_OWNER_EMAIL = 'numbercutter@protonmail.com';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const isOwner = user.email === PRIMARY_DATA_OWNER_EMAIL;
        
        const context = {
            isOwner,
            viewingOwnData: true, // For now, everyone views their own data
            dataOwnerEmail: user.email || '',
            currentUserEmail: user.email || ''
        };

        return NextResponse.json(context);
    } catch (error) {
        console.error('Error getting user context:', error);
        return NextResponse.json({ error: 'Failed to get user context' }, { status: 500 });
    }
}
