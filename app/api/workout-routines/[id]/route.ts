import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('workout_routines')
            .update({
                name: body.name,
                description: body.description || null,
                muscle_groups: body.muscle_groups || null,
                day_of_week: body.day_of_week || null,
                notes: body.notes || null,
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating workout routine:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating workout routine:', error);
        return NextResponse.json({ error: 'Failed to update workout routine' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();

        const { error } = await supabase.from('workout_routines').delete().eq('id', id).eq('user_id', userId);

        if (error) {
            console.error('Error deleting workout routine:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json({ message: 'Workout routine deleted successfully' });
    } catch (error) {
        console.error('Error deleting workout routine:', error);
        return NextResponse.json({ error: 'Failed to delete workout routine' }, { status: 500 });
    }
}
