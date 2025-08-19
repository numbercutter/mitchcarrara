import { getDatabaseContext } from '@/lib/database/server-helpers';
import CollaborativeNotesClient from './components/CollaborativeNotesClient';

export default async function NotesPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Get current user info
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch collaborative note content
    let content = '# Shared Notes\n\nWelcome to the collaborative notepad! Start typing here...\n\n';

    try {
        const { data: note } = await supabase.from('collaborative_notes').select('content').single();

        if (note?.content) {
            content = note.content;
        }
    } catch (error) {
        console.log('No collaborative note found, will create one');
    }

    const currentUser = {
        email: user?.email || 'unknown@example.com',
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Unknown User',
    };

    return <CollaborativeNotesClient initialContent={content} currentUser={currentUser} />;
}
