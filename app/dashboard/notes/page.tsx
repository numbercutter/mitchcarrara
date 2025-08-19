import { getDatabaseContext } from '@/lib/database/server-helpers';
import EnhancedNotesClient from './components/EnhancedNotesClient';

export default async function NotesPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Get current user info
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch user's notes
    const { data: notes } = await supabase.from('notes').select('*').eq('user_id', userId).eq('is_archived', false).order('updated_at', { ascending: false });

    const currentUser = {
        email: user?.email || 'unknown@example.com',
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Unknown User',
    };

    return <EnhancedNotesClient initialNotes={notes || []} currentUser={currentUser} />;
}
