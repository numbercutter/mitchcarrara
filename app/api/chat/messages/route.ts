import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        // Get the actual authenticated user ID for message attribution
        const { getCurrentUserId } = await import('@/lib/database/server-helpers');
        const actualUserId = await getCurrentUserId();

        // Get or create today's conversation
        const today = new Date().toISOString().split('T')[0];
        const conversationTitle = `Chat - ${new Date().toLocaleDateString()}`;

        let { data: conversation, error: convError } = await supabase.from('chat_conversations').select('id').eq('user_id', userId).eq('title', conversationTitle).single();

        if (convError && convError.code === 'PGRST116') {
            // Conversation doesn't exist, create it
            const { data: newConversation, error: createError } = await supabase
                .from('chat_conversations')
                .insert({
                    title: conversationTitle,
                    user_id: userId,
                })
                .select('id')
                .single();

            if (createError) {
                console.error('Error creating conversation:', createError);
                return NextResponse.json({ error: createError.message }, { status: 400 });
            }

            conversation = newConversation;
        } else if (convError) {
            console.error('Error fetching conversation:', convError);
            return NextResponse.json({ error: convError.message }, { status: 400 });
        }

        // Add the message
        const { data: message, error: messageError } = await supabase
            .from('chat_messages')
            .insert({
                conversation_id: conversation.id,
                content: body.content,
                sender: body.sender || 'user',
                message_type: body.message_type || 'text',
                metadata: body.metadata || {},
                user_id: actualUserId, // Use the actual authenticated user's ID
            })
            .select()
            .single();

        if (messageError) {
            console.error('Error creating message:', messageError);
            return NextResponse.json({ error: messageError.message }, { status: 400 });
        }

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
