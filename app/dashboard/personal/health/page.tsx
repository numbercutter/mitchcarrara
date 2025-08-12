import { getDatabaseContext } from '@/lib/database/server-helpers';
import HealthClient from './components/HealthClient';

export default async function HealthFitnessPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch health-related data from the database
    const [supplementsResponse, mealsResponse, workoutLogsResponse, healthMetricsResponse] = await Promise.all([
        supabase.from('supplements').select('*').eq('user_id', userId).order('name', { ascending: true }),
        supabase.from('meals').select('*').eq('user_id', userId).order('meal_date', { ascending: false }).limit(50), // Last 50 meals
        supabase.from('workout_logs').select('*').eq('user_id', userId).order('workout_date', { ascending: false }).limit(30), // Last 30 workouts
        supabase.from('health_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: false }).limit(100), // Last 100 health metrics
    ]);

    const supplements = supplementsResponse.data || [];
    const meals = mealsResponse.data || [];
    const workoutLogs = workoutLogsResponse.data || [];
    const healthMetrics = healthMetricsResponse.data || [];

    return <HealthClient initialSupplements={supplements} initialMeals={meals} initialWorkouts={workoutLogs} initialHealthMetrics={healthMetrics} />;
}
