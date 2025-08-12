import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('diet_plan_items').select('*').eq('user_id', userId).eq('is_active', true).order('meal_type').order('sort_order');

        if (error) {
            console.error('Error fetching diet plan items:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching diet plan items:', error);
        return NextResponse.json({ error: 'Failed to fetch diet plan items' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('diet_plan_items')
            .insert({
                meal_type: body.meal_type,
                name: body.name,
                description: body.description || null,
                ingredients: body.ingredients || null,
                calories: body.calories || null,
                protein: body.protein || null,
                carbs: body.carbs || null,
                fats: body.fats || null,
                notes: body.notes || null,
                sort_order: body.sort_order || 0,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating diet plan item:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating diet plan item:', error);
        return NextResponse.json({ error: 'Failed to create diet plan item' }, { status: 500 });
    }
}

