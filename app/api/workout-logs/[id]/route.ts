import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id: workoutId } = await params;
        const body = await request.json();

        const { data, error } = await supabase
            .from('workout_logs')
            .update({
                name: body.name,
                workout_date: body.workout_date,
                type: body.type,
                duration: body.duration,
                intensity: body.intensity,
                exercises: body.exercises,
                notes: body.notes,
            })
            .eq('id', workoutId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating workout:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating workout:', error);
        return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id: workoutId } = await params;

        const { error } = await supabase.from('workout_logs').delete().eq('id', workoutId).eq('user_id', userId);

        if (error) {
            console.error('Error deleting workout:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting workout:', error);
        return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
    }
}
