import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { createTaskChatMessage } from '@/lib/database/actions';
import { TablesInsert } from '@/types/database';

export async function POST(request: NextRequest) {
    try {
        const { company, userId } = await getDatabaseContext();
        const body = await request.json();

        const messageData: Omit<TablesInsert<'task_chat_messages'>, 'user_id'> = {
            message: body.message,
            sender: body.sender || 'me',
        };

        const result = await createTaskChatMessage(company, userId, messageData);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error creating task chat message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
