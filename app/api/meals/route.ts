import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('meals')
            .insert({
                name: body.name,
                meal_date: body.meal_date || new Date().toISOString().split('T')[0],
                meal_time: body.meal_time || null,
                calories: body.calories || null,
                protein: body.protein || null,
                carbs: body.carbs || null,
                fats: body.fats || null,
                notes: body.notes || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating meal:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating meal:', error);
        return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
    }
}
