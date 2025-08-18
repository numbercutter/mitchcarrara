import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();
        const params = await context.params;
        const taskId = params.id;

        // Update the task with the provided data
        const { data, error } = await supabase
            .from('tasks')
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq('id', taskId)
            .eq('user_id', userId) // Ensure user can only update their own tasks
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/tasks');
        revalidatePath('/dashboard/tasks/billing');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const params = await context.params;
        const taskId = params.id;

        const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId); // Ensure user can only delete their own tasks

        if (error) {
            console.error('Error deleting task:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/tasks');
        revalidatePath('/dashboard/tasks/billing');
        return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
