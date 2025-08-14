import { getDatabaseContext } from '@/lib/database/server-helpers';
import TasksClient from './components/TasksClient';

export default async function TasksPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch tasks data
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });

    // Fetch time tracking stats (this could also be done client-side)
    let timeStats = null;
    try {
        // We'll fetch this client-side to avoid complications with server-side requests
        timeStats = {
            thisWeek: { totalHours: 0, dailyHours: [0,0,0,0,0,0,0], mostWorkedTask: null, mostWorkedHours: 0 },
            lastWeek: { totalHours: 0 }
        };
    } catch (error) {
        console.error('Error fetching time stats:', error);
    }

    return <TasksClient initialTasks={tasks || []} initialTimeStats={timeStats} />;
}
