import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();
        const { id } = await params;

        const { data, error } = await supabase
            .from('calendar_events')
            .update({
                title: body.title,
                description: body.description,
                start_datetime: body.start_datetime,
                end_datetime: body.end_datetime,
                event_type: body.event_type,
                assignee: body.assignee,
                priority: body.priority,
                location: body.location,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating calendar event:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/tasks/calendar');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating calendar event:', error);
        return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id } = await params;

        const { error } = await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', userId);

        if (error) {
            console.error('Error deleting calendar event:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/tasks/calendar');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
    }
}
