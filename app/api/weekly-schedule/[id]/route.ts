import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('weekly_schedule')
            .update({
                monday: body.monday,
                tuesday: body.tuesday,
                wednesday: body.wednesday,
                thursday: body.thursday,
                friday: body.friday,
                saturday: body.saturday,
                sunday: body.sunday,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating weekly schedule:', error);
        return NextResponse.json({ error: 'Failed to update weekly schedule' }, { status: 500 });
    }
}
