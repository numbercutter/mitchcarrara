import { NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();
        
        // Get actual data and count manually
        const [healthMetrics, workoutLogs, books, meals, supplements] = await Promise.all([
            supabase.from('health_metrics').select('*').eq('user_id', userId),
            supabase.from('workout_logs').select('*').eq('user_id', userId),
            supabase.from('books').select('*').eq('user_id', userId),
            supabase.from('meals').select('*').eq('user_id', userId),
            supabase.from('supplements').select('*').eq('user_id', userId),
        ]);
        
        return NextResponse.json({
            userId_being_queried: userId,
            data_counts: {
                health_metrics: healthMetrics.data?.length || 0,
                workout_logs: workoutLogs.data?.length || 0,
                books: books.data?.length || 0,
                meals: meals.data?.length || 0,
                supplements: supplements.data?.length || 0,
            },
            sample_data: {
                health_metrics: healthMetrics.data?.slice(0, 3),
                books: books.data?.slice(0, 3),
                meals: meals.data?.slice(0, 3),
                supplements: supplements.data?.slice(0, 3),
            },
            errors: {
                health_metrics: healthMetrics.error?.message,
                workout_logs: workoutLogs.error?.message,
                books: books.error?.message,
                meals: meals.error?.message,
                supplements: supplements.error?.message,
            }
        });
    } catch (error) {
        console.error('Debug data error:', error);
        return NextResponse.json({ 
            error: 'Debug data failed', 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}