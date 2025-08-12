import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id: mealId } = await params;
        const body = await request.json();

        const { data, error } = await supabase
            .from('meals')
            .update({
                name: body.name,
                meal_date: body.meal_date,
                meal_time: body.meal_time,
                calories: body.calories,
                protein: body.protein,
                carbs: body.carbs,
                fats: body.fats,
                notes: body.notes,
            })
            .eq('id', mealId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating meal:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating meal:', error);
        return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id: mealId } = await params;

        const { error } = await supabase.from('meals').delete().eq('id', mealId).eq('user_id', userId);

        if (error) {
            console.error('Error deleting meal:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting meal:', error);
        return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
    }
}
