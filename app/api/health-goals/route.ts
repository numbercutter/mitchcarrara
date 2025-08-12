import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('health_goals').select('*').eq('user_id', userId).order('priority').order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching health goals:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching health goals:', error);
        return NextResponse.json({ error: 'Failed to fetch health goals' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('health_goals')
            .insert({
                category: body.category,
                title: body.title,
                description: body.description || null,
                current_value: body.current_value || null,
                target_value: body.target_value || null,
                status: body.status || 'active',
                priority: body.priority || 2,
                target_date: body.target_date || null,
                notes: body.notes || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating health goal:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating health goal:', error);
        return NextResponse.json({ error: 'Failed to create health goal' }, { status: 500 });
    }
}

