import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { createWorkoutLog } from '@/lib/database/actions';
import { TablesInsert } from '@/types/database';

export async function POST(request: NextRequest) {
    try {
        const { company, userId } = await getDatabaseContext();
        const body = await request.json();

        const workoutData: Omit<TablesInsert<'workout_logs'>, 'user_id'> = {
            name: body.name,
            workout_date: body.workout_date || new Date().toISOString().split('T')[0],
            type: body.type || null,
            duration: body.duration || null,
            intensity: body.intensity || null,
            exercises: body.exercises || null,
            notes: body.notes || null,
        };

        const result = await createWorkoutLog(company, userId, workoutData);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error creating workout log:', error);
        return NextResponse.json({ error: 'Failed to create workout log' }, { status: 500 });
    }
}
