import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('daily_routines')
            .insert({
                name: body.name,
                description: body.description || null,
                day_of_week: body.day_of_week,
                is_active: body.is_active !== undefined ? body.is_active : true,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating routine:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/routines');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating routine:', error);
        return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 });
    }
}
