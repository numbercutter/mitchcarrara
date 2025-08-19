import { getDatabaseContext } from '@/lib/database/server-helpers';
import VisionClient from './components/VisionClient';

export default async function VisionBoardPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch canvas data from notes table
    const { data: canvasNotes } = await supabase.from('notes').select('*').eq('user_id', userId).eq('title', 'Vision Canvas').order('created_at', { ascending: false });

    return <VisionClient initialCards={canvasNotes || []} />;
}
