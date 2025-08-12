import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('workout_notes').select('*').eq('user_id', userId).single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching workout notes:', error);
        return NextResponse.json({ error: 'Failed to fetch workout notes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('workout_notes')
            .upsert({
                user_id: userId,
                current_focus: body.current_focus,
                rest_times: body.rest_times,
                progression: body.progression,
                general_notes: body.general_notes,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error saving workout notes:', error);
        return NextResponse.json({ error: 'Failed to save workout notes' }, { status: 500 });
    }
}
