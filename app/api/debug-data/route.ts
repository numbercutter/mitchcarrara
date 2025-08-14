import { NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();
        
        // Check what data exists for this user ID
        const [healthMetrics, workoutLogs, books, meals, supplements] = await Promise.all([
            supabase.from('health_metrics').select('count').eq('user_id', userId).single(),
            supabase.from('workout_logs').select('count').eq('user_id', userId).single(), 
            supabase.from('books').select('count').eq('user_id', userId).single(),
            supabase.from('meals').select('count').eq('user_id', userId).single(),
            supabase.from('supplements').select('count').eq('user_id', userId).single(),
        ]);

        // Also get a sample of actual data
        const sampleData = await Promise.all([
            supabase.from('health_metrics').select('*').eq('user_id', userId).limit(3),
            supabase.from('books').select('*').eq('user_id', userId).limit(3),
            supabase.from('meals').select('*').eq('user_id', userId).limit(3),
        ]);
        
        return NextResponse.json({
            userId_being_queried: userId,
            data_counts: {
                health_metrics: healthMetrics.count,
                workout_logs: workoutLogs.count, 
                books: books.count,
                meals: meals.count,
                supplements: supplements.count,
            },
            sample_data: {
                health_metrics: sampleData[0].data,
                books: sampleData[1].data,
                meals: sampleData[2].data,
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