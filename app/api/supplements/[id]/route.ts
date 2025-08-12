import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id: supplementId } = await params;
        const body = await request.json();

        const { data, error } = await supabase
            .from('supplements')
            .update({
                name: body.name,
                dosage: body.dosage,
                frequency: body.frequency,
                time_of_day: body.time_of_day,
                notes: body.notes,
                is_active: body.is_active,
                start_date: body.start_date,
            })
            .eq('id', supplementId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating supplement:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating supplement:', error);
        return NextResponse.json({ error: 'Failed to update supplement' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id: supplementId } = await params;

        const { error } = await supabase.from('supplements').delete().eq('id', supplementId).eq('user_id', userId);

        if (error) {
            console.error('Error deleting supplement:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting supplement:', error);
        return NextResponse.json({ error: 'Failed to delete supplement' }, { status: 500 });
    }
}
