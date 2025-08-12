import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data: conversations, error } = await supabase
            .from('chat_conversations')
            .select(
                `
                id,
                title,
                created_at,
                updated_at,
                is_archived,
                metadata,
                chat_messages(count)
            `
            )
            .eq('user_id', userId)
            .eq('is_archived', false)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data: conversation, error } = await supabase
            .from('chat_conversations')
            .insert({
                title: body.title || `Chat - ${new Date().toLocaleDateString()}`,
                user_id: userId,
                metadata: body.metadata || {},
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating conversation:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }
}
