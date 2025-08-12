import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('health_focus').select('*').eq('user_id', userId).single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching current focus:', error);
        return NextResponse.json({ error: 'Failed to fetch current focus' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('health_focus')
            .upsert({
                user_id: userId,
                period: body.period,
                title: body.title,
                description: body.description,
                key_metrics: body.key_metrics || {},
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error saving current focus:', error);
        return NextResponse.json({ error: 'Failed to save current focus' }, { status: 500 });
    }
}
