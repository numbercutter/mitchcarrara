import { getDatabaseContext } from '@/lib/database/server-helpers';
import RoutinesClient from './components/RoutinesClient';

export default async function RoutinesPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch routines and routine items from the database
    const [routinesResponse, routineItemsResponse] = await Promise.all([
        supabase.from('daily_routines').select('*').eq('user_id', userId).order('day_of_week', { ascending: true }),
        supabase.from('routine_items').select('*').eq('user_id', userId).order('order_in_routine', { ascending: true }),
    ]);

    const routines = routinesResponse.data || [];
    const routineItems = routineItemsResponse.data || [];

    // Group routine items by routine_id
    const routinesWithItems = routines.map((routine) => ({
        ...routine,
        items: routineItems.filter((item) => item.routine_id === routine.id),
    }));

    return <RoutinesClient initialRoutines={routinesWithItems} />;
}
