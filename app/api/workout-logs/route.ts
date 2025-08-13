import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('workout_logs')
            .insert({
                name: body.name,
                workout_date: body.workout_date || new Date().toISOString().split('T')[0],
                type: body.type || null,
                duration: body.duration || null,
                intensity: body.intensity || null,
                exercises: body.exercises || null,
                notes: body.notes || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating workout log:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating workout log:', error);
        return NextResponse.json({ error: 'Failed to create workout log' }, { status: 500 });
    }
}
