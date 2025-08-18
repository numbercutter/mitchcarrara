import { getDatabaseContext } from '@/lib/database/server-helpers';
import BillingClient from './components/BillingClient';

export default async function BillingPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch assistant tasks with time entries
    const { data: tasks } = await supabase
        .from('tasks')
        .select(
            `
            *,
            time_entries (
                id,
                minutes,
                date,
                created_at
            )
        `
        )
        .eq('user_id', userId)
        .eq('assignee', 'assistant')
        .order('created_at', { ascending: false });

    return <BillingClient initialTasks={tasks || []} />;
}
