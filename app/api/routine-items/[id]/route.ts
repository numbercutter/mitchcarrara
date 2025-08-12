import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('routine_items')
            .update({
                name: body.name,
                description: body.description,
                duration_minutes: body.duration_minutes,
                category: body.category,
                order_in_routine: body.order_in_routine,
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating routine item:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/routines');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating routine item:', error);
        return NextResponse.json({ error: 'Failed to update routine item' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { error } = await supabase.from('routine_items').delete().eq('id', params.id).eq('user_id', userId);

        if (error) {
            console.error('Error deleting routine item:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/routines');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting routine item:', error);
        return NextResponse.json({ error: 'Failed to delete routine item' }, { status: 500 });
    }
}
