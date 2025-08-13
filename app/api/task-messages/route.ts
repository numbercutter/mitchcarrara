import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('task_chat_messages')
            .insert({
                message: body.message,
                sender: body.sender || 'me',
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating task chat message:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/tasks');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating task chat message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
