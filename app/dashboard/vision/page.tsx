import { getDatabaseContext } from '@/lib/database/server-helpers';
import VisionClient from './components/VisionClient';

export default async function VisionBoardPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch data directly using the Supabase client
    const { data: visionCards } = await supabase.from('vision_cards').select('*').eq('user_id', userId).order('created_at', { ascending: false });

    return <VisionClient initialCards={visionCards || []} />;
}
