import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('routine_items')
            .insert({
                routine_id: body.routine_id,
                name: body.name,
                description: body.description || null,
                duration_minutes: body.duration_minutes || 0,
                category: body.category || 'other',
                order_in_routine: body.order_in_routine || 0,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating routine item:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/routines');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating routine item:', error);
        return NextResponse.json({ error: 'Failed to create routine item' }, { status: 500 });
    }
}
