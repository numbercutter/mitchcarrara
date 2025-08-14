import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        let query = supabase
            .from('time_entries')
            .select(`
                *,
                tasks:task_id (
                    id,
                    title,
                    status,
                    priority
                )
            `)
            .eq('user_id', userId)
            .order('date', { ascending: false });

        // Filter by date range if provided
        if (startDate && endDate) {
            query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data: timeEntries, error } = await query;

        if (error) {
            console.error('Error fetching time entries:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(timeEntries);
    } catch (error) {
        console.error('Error fetching time entries:', error);
        return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('time_entries')
            .insert({
                task_id: body.task_id,
                minutes: body.minutes,
                date: body.date,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating time entry:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating time entry:', error);
        return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
    }
}