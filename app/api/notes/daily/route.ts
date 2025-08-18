import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { searchParams } = new URL(request.url);

        // Get date from query params or use today
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

        const { data, error } = await supabase.from('notes').select('*').eq('user_id', userId).eq('note_type', 'daily').eq('note_date', date).eq('is_archived', false).single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found"
            console.error('Error fetching daily note:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // If no daily note exists, return null
        if (!data) {
            return NextResponse.json(null);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching daily note:', error);
        return NextResponse.json({ error: 'Failed to fetch daily note' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        // Get date from body or use today
        const date = body.note_date || new Date().toISOString().split('T')[0];

        // Check if daily note already exists for this date
        const { data: existingDaily } = await supabase
            .from('notes')
            .select('id')
            .eq('user_id', userId)
            .eq('note_type', 'daily')
            .eq('note_date', date)
            .eq('is_archived', false)
            .single();

        if (existingDaily) {
            return NextResponse.json({ error: 'Daily note already exists for this date' }, { status: 409 });
        }

        // Create daily note with default title if not provided
        const title =
            body.title ||
            `Daily Note - ${new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}`;

        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: userId,
                title,
                content: body.content || '',
                note_type: 'daily',
                note_date: date,
                tags: body.tags || ['daily'],
                metadata: body.metadata || {},
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating daily note:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/notes');
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error creating daily note:', error);
        return NextResponse.json({ error: 'Failed to create daily note' }, { status: 500 });
    }
}
