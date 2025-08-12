import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('supplements')
            .insert({
                name: body.name,
                dosage: body.dosage || null,
                frequency: body.frequency || null,
                time_of_day: body.time_of_day || null,
                notes: body.notes || null,
                is_active: body.is_active !== undefined ? body.is_active : true,
                start_date: body.start_date || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating supplement:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating supplement:', error);
        return NextResponse.json({ error: 'Failed to create supplement' }, { status: 500 });
    }
}
