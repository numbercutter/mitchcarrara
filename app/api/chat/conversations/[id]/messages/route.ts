import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id: conversationId } = await params;

        // Verify user has access to this conversation
        const { data: conversation, error: convError } = await supabase.from('chat_conversations').select('id').eq('id', conversationId).eq('user_id', userId).single();

        if (convError || !conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const { data: messages, error } = await supabase.from('chat_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id: conversationId } = await params;
        const body = await request.json();

        // Get the actual authenticated user ID for message attribution
        const { getCurrentUserId } = await import('@/lib/database/server-helpers');
        const actualUserId = await getCurrentUserId();

        // Verify user has access to this conversation
        const { data: conversation, error: convError } = await supabase.from('chat_conversations').select('id').eq('id', conversationId).eq('user_id', userId).single();

        if (convError || !conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const { data: message, error } = await supabase
            .from('chat_messages')
            .insert({
                conversation_id: conversationId,
                content: body.content,
                sender: body.sender || 'user',
                message_type: body.message_type || 'text',
                metadata: body.metadata || {},
                user_id: actualUserId, // Use the actual authenticated user's ID
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating message:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
