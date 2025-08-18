import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { searchParams } = new URL(request.url);

        // Query parameters for filtering
        const noteType = searchParams.get('type');
        const isArchived = searchParams.get('archived') === 'true';
        const isPinned = searchParams.get('pinned') === 'true';
        const tag = searchParams.get('tag');
        const date = searchParams.get('date');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase.from('notes').select('*').eq('user_id', userId).eq('is_archived', isArchived).order('updated_at', { ascending: false });

        // Apply filters
        if (noteType) {
            query = query.eq('note_type', noteType);
        }

        if (isPinned) {
            query = query.eq('is_pinned', true);
        }

        if (tag) {
            query = query.contains('tags', [tag]);
        }

        if (date) {
            query = query.eq('note_date', date);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: notes, error } = await query;

        if (error) {
            console.error('Error fetching notes:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // For daily notes, check if one already exists for the date
        if (body.note_type === 'daily' && body.note_date) {
            const { data: existingDaily } = await supabase
                .from('notes')
                .select('id')
                .eq('user_id', userId)
                .eq('note_type', 'daily')
                .eq('note_date', body.note_date)
                .eq('is_archived', false)
                .single();

            if (existingDaily) {
                return NextResponse.json({ error: 'Daily note already exists for this date' }, { status: 409 });
            }
        }

        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: userId,
                title: body.title,
                content: body.content || '',
                note_type: body.note_type || 'general',
                note_date: body.note_date || null,
                tags: body.tags || [],
                is_pinned: body.is_pinned || false,
                metadata: body.metadata || {},
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/notes');
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}
