import { getDatabaseContext } from '@/lib/database/server-helpers';
import CalendarClient from './components/CalendarClient';

export default async function CalendarPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch calendar events from the database
    const { data: events } = await supabase.from('calendar_events').select('*').eq('user_id', userId).order('start_date', { ascending: true });

    return <CalendarClient initialEvents={events || []} />;
}
