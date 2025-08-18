import { getDatabaseContext } from '@/lib/database/server-helpers';
import NotesClient from './components/NotesClient';

export default async function NotesPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch user's notes
    const { data: notes } = await supabase.from('notes').select('*').eq('user_id', userId).eq('is_archived', false).order('updated_at', { ascending: false });

    // Get today's daily note if it exists
    const today = new Date().toISOString().split('T')[0];
    const { data: todayNote } = await supabase.from('notes').select('*').eq('user_id', userId).eq('note_type', 'daily').eq('note_date', today).eq('is_archived', false).single();

    return <NotesClient initialNotes={notes || []} todayNote={todayNote || null} />;
}
