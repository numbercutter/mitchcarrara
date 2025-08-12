import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('nutrition_guidelines').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);

        if (error) {
            console.error('Error fetching nutrition guidelines:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data[0] || null);
    } catch (error) {
        console.error('Error fetching nutrition guidelines:', error);
        return NextResponse.json({ error: 'Failed to fetch nutrition guidelines' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('nutrition_guidelines')
            .insert({
                daily_calories: body.daily_calories || null,
                protein_target: body.protein_target || null,
                carbs_target: body.carbs_target || null,
                fat_target: body.fat_target || null,
                water_target: body.water_target || null,
                notes: body.notes || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating nutrition guidelines:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating nutrition guidelines:', error);
        return NextResponse.json({ error: 'Failed to create nutrition guidelines' }, { status: 500 });
    }
}

