import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('weekly_schedule').select('*').eq('user_id', userId).single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching weekly schedule:', error);
        return NextResponse.json({ error: 'Failed to fetch weekly schedule' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('weekly_schedule')
            .upsert({
                user_id: userId,
                monday: body.monday,
                tuesday: body.tuesday,
                wednesday: body.wednesday,
                thursday: body.thursday,
                friday: body.friday,
                saturday: body.saturday,
                sunday: body.sunday,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error saving weekly schedule:', error);
        return NextResponse.json({ error: 'Failed to save weekly schedule' }, { status: 500 });
    }
}
