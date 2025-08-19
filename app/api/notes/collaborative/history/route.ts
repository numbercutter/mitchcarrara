import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();

        // Get edit history for the collaborative note
        const { data: history, error } = await supabase.from('note_edit_history').select('*').order('timestamp', { ascending: false }).limit(50); // Get last 50 edits

        if (error) {
            console.error('Error fetching edit history:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Transform the data for frontend
        const transformedHistory = history.map((edit) => ({
            id: edit.id,
            content: edit.content_change,
            position: 0, // Not tracking position for now
            length: edit.content_change?.length || 0,
            user_name: edit.user_name,
            user_email: edit.user_email,
            timestamp: edit.timestamp,
            type: edit.edit_type,
        }));

        return NextResponse.json(transformedHistory);
    } catch (error) {
        console.error('Error in collaborative notes history GET:', error);
        return NextResponse.json({ error: 'Failed to fetch edit history' }, { status: 500 });
    }
}
