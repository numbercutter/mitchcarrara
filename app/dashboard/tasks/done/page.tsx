import { getDatabaseContext } from '@/lib/database/server-helpers';
import DoneTasksClient from './components/DoneTasksClient';

export default async function DoneTasksPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch completed and paid tasks
    const { data: doneTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .or('status.eq.done,payment_status.eq.paid')
        .order('updated_at', { ascending: false });

    return <DoneTasksClient initialTasks={doneTasks || []} />;
}
