import { getDatabaseContext } from '@/lib/database/server-helpers';
import CalendarClient from './components/CalendarClient';

export default async function CalendarPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch calendar events, tasks, and contacts with birthdays from the database
    const [eventsResult, tasksResult, contactsResult] = await Promise.all([
        supabase.from('calendar_events').select('*').eq('user_id', userId).order('start_datetime', { ascending: true }),
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('contacts').select('id, name, birthday, relationship').eq('user_id', userId).not('birthday', 'is', null),
    ]);

    return (
        <CalendarClient 
            initialEvents={eventsResult.data || []} 
            initialTasks={tasksResult.data || []} 
            initialContacts={contactsResult.data || []}
        />
    );
}
