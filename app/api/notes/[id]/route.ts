import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const params = await context.params;
        const noteId = params.id;

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .eq('user_id', userId) // Ensure user can only access their own notes
            .single();

        if (error) {
            console.error('Error fetching note:', error);
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();
        const params = await context.params;
        const noteId = params.id;

        // If updating to daily note type, check for conflicts
        if (body.note_type === 'daily' && body.note_date) {
            const { data: existingDaily } = await supabase
                .from('notes')
                .select('id')
                .eq('user_id', userId)
                .eq('note_type', 'daily')
                .eq('note_date', body.note_date)
                .eq('is_archived', false)
                .neq('id', noteId) // Exclude current note
                .single();

            if (existingDaily) {
                return NextResponse.json({ error: 'Daily note already exists for this date' }, { status: 409 });
            }
        }

        // Update the note with the provided data
        const { data, error } = await supabase
            .from('notes')
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq('id', noteId)
            .eq('user_id', userId) // Ensure user can only update their own notes
            .select()
            .single();

        if (error) {
            console.error('Error updating note:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/notes');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const params = await context.params;
        const noteId = params.id;

        const { error } = await supabase.from('notes').delete().eq('id', noteId).eq('user_id', userId); // Ensure user can only delete their own notes

        if (error) {
            console.error('Error deleting note:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/notes');
        return NextResponse.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}
