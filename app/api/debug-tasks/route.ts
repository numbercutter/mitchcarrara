import { NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        // Get all existing tasks to see what status values are valid
        const { data: tasks, error } = await supabase.from('tasks').select('id, status, priority').limit(20);

        if (error) {
            console.error('Error fetching tasks:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Get unique status and priority values
        const uniqueStatuses = Array.from(new Set(tasks?.map((t) => t.status).filter(Boolean)));
        const uniquePriorities = Array.from(new Set(tasks?.map((t) => t.priority).filter(Boolean)));

        console.log('🔍 Existing status values in DB:', uniqueStatuses);
        console.log('🔍 Existing priority values in DB:', uniquePriorities);

        return NextResponse.json({
            uniqueStatuses,
            uniquePriorities,
            totalTasks: tasks?.length || 0,
            sampleTasks: tasks?.slice(0, 5),
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        return NextResponse.json({ error: 'Failed to debug tasks' }, { status: 500 });
    }
}
