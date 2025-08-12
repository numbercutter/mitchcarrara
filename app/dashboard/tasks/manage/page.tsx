import { getDatabaseContext } from '@/lib/database/server-helpers';
import TaskManageClient from './components/TaskManageClient';

export default async function TaskManagePage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch tasks from the database
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });

    return <TaskManageClient initialTasks={tasks || []} />;
}
