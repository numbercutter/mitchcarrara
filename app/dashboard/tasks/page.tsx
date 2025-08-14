import { getDatabaseContext } from '@/lib/database/server-helpers';
import TasksClient from './components/TasksClient';

export default async function TasksPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch tasks data
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });

    return <TasksClient initialTasks={tasks || []} />;
}
