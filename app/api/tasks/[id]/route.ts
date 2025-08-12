import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { updateTask, deleteTask } from '@/lib/database/actions';
import { TablesUpdate } from '@/types/database';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { company } = await getDatabaseContext();
        const body = await request.json();
        const { id: taskId } = await params;

        const updateData: TablesUpdate<'tasks'> = {};

        // Only include fields that are being updated
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.assignee !== undefined) updateData.assignee = body.assignee;
        if (body.due_date !== undefined) updateData.due_date = body.due_date;
        if (body.estimate !== undefined) updateData.estimate = body.estimate;
        if (body.labels !== undefined) updateData.labels = body.labels;

        const result = await updateTask(company, taskId, updateData);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { company } = await getDatabaseContext();
        const { id: taskId } = await params;

        const result = await deleteTask(company, taskId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
