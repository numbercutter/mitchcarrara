import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('personal_activities')
            .insert({
                title: body.title,
                activity_type: body.activity_type,
                description: body.description || null,
                activity_date: body.activity_date || new Date().toISOString().split('T')[0],
                duration: body.duration || null,
                metadata: body.metadata || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating personal activity:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating personal activity:', error);
        return NextResponse.json({ error: 'Failed to create personal activity' }, { status: 500 });
    }
}
