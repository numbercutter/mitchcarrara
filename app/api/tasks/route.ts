import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        console.log('📝 Creating task with data:', {
            title: body.title,
            description: body.description,
            status: body.status,
            priority: body.priority,
            assignee: body.assignee,
            user_id: userId,
        });

        const taskData = {
            title: body.title,
            description: body.description || null,
            status: body.status || 'todo',
            priority: body.priority || 'medium',
            assignee: body.assignee || 'assistant',
            due_date: body.due_date || null,
            estimate: body.estimate || null,
            labels: body.labels || null,
            user_id: userId,
        };

        console.log('📤 Final task data being inserted:', taskData);

        const { data, error } = await supabase.from('tasks').insert(taskData).select().single();

        if (error) {
            console.error('Error creating task:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/tasks');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
