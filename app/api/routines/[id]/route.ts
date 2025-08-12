import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('daily_routines')
            .update({
                name: body.name,
                description: body.description,
                day_of_week: body.day_of_week,
                is_active: body.is_active,
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating routine:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/routines');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating routine:', error);
        return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { supabase, userId } = await getDatabaseContext();

        // First delete all routine items
        await supabase.from('routine_items').delete().eq('routine_id', params.id).eq('user_id', userId);

        // Then delete the routine
        const { error } = await supabase.from('daily_routines').delete().eq('id', params.id).eq('user_id', userId);

        if (error) {
            console.error('Error deleting routine:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/routines');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting routine:', error);
        return NextResponse.json({ error: 'Failed to delete routine' }, { status: 500 });
    }
}
