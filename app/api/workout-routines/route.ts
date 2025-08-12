import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase
            .from('workout_routines')
            .select(
                `
                *,
                workout_exercises(*)
            `
            )
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('day_of_week');

        if (error) {
            console.error('Error fetching workout routines:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching workout routines:', error);
        return NextResponse.json({ error: 'Failed to fetch workout routines' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('workout_routines')
            .insert({
                name: body.name,
                description: body.description || null,
                muscle_groups: body.muscle_groups || null,
                day_of_week: body.day_of_week || null,
                notes: body.notes || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating workout routine:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating workout routine:', error);
        return NextResponse.json({ error: 'Failed to create workout routine' }, { status: 500 });
    }
}

