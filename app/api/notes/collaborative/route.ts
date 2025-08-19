import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();

        // Get the main collaborative note (there's only one shared note)
        const { data: note, error } = await supabase.from('collaborative_notes').select('*').single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found"
            console.error('Error fetching collaborative note:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // If no note exists, create one
        if (!note) {
            const { data: newNote, error: createError } = await supabase
                .from('collaborative_notes')
                .insert({
                    content: '# Shared Notes\n\nWelcome to the collaborative notepad! Start typing here...\n\n',
                    last_edited_by: userId,
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating collaborative note:', createError);
                return NextResponse.json({ error: createError.message }, { status: 400 });
            }

            return NextResponse.json({
                content: newNote.content,
                lastEditedBy: newNote.last_edited_by,
                updatedAt: newNote.updated_at,
            });
        }

        return NextResponse.json({
            content: note.content,
            lastEditedBy: note.last_edited_by,
            updatedAt: note.updated_at,
        });
    } catch (error) {
        console.error('Error in collaborative notes GET:', error);
        return NextResponse.json({ error: 'Failed to fetch collaborative note' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { content, user_name, user_email } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Update or create the collaborative note
        const { data: existingNote } = await supabase.from('collaborative_notes').select('*').single();

        let result;
        if (existingNote) {
            // Update existing note
            const { data: updatedNote, error } = await supabase
                .from('collaborative_notes')
                .update({
                    content,
                    last_edited_by: userId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingNote.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating collaborative note:', error);
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            result = updatedNote;
        } else {
            // Create new note
            const { data: newNote, error } = await supabase
                .from('collaborative_notes')
                .insert({
                    content,
                    last_edited_by: userId,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating collaborative note:', error);
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            result = newNote;
        }

        // Create edit history entry
        const { error: historyError } = await supabase.from('note_edit_history').insert({
            note_id: result.id,
            user_id: userId,
            user_name: user_name || user_email?.split('@')[0] || 'Unknown',
            user_email: user_email || '',
            content_change: content.substring(0, 500), // Store first 500 chars
            edit_type: existingNote ? 'update' : 'create',
            timestamp: new Date().toISOString(),
        });

        if (historyError) {
            console.error('Error creating edit history:', historyError);
            // Don't fail the request, just log the error
        }

        return NextResponse.json({
            success: true,
            note: result,
            edit: {
                id: crypto.randomUUID(),
                content: content.substring(0, 100),
                user_name: user_name || user_email?.split('@')[0] || 'Unknown',
                user_email: user_email || '',
                timestamp: new Date().toISOString(),
                type: 'update',
            },
        });
    } catch (error) {
        console.error('Error in collaborative notes POST:', error);
        return NextResponse.json({ error: 'Failed to save collaborative note' }, { status: 500 });
    }
}
