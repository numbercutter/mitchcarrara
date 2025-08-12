import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('calendar_events')
            .insert({
                title: body.title,
                description: body.description || null,
                start_datetime: body.start_datetime,
                end_datetime: body.end_datetime,
                event_type: body.event_type || 'task',
                assignee: body.assignee || null,
                priority: body.priority || 'medium',
                location: body.location || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating calendar event:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/tasks/calendar');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating calendar event:', error);
        return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }
}
