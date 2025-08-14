import { getDatabaseContext } from '@/lib/database/server-helpers';
import CalendarClient from './components/CalendarClient';

export default async function CalendarPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch calendar events and tasks from the database
    const [eventsResult, tasksResult] = await Promise.all([
        supabase.from('calendar_events').select('*').eq('user_id', userId).order('start_datetime', { ascending: true }),
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    return <CalendarClient initialEvents={eventsResult.data || []} initialTasks={tasksResult.data || []} />;
}
