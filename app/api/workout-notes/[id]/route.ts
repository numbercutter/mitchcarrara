import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('workout_notes')
            .update({
                current_focus: body.current_focus,
                rest_times: body.rest_times,
                progression: body.progression,
                general_notes: body.general_notes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating workout notes:', error);
        return NextResponse.json({ error: 'Failed to update workout notes' }, { status: 500 });
    }
}
