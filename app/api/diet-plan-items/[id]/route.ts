import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('diet_plan_items')
            .update({
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
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating diet plan item:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating diet plan item:', error);
        return NextResponse.json({ error: 'Failed to update diet plan item' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();

        const { error } = await supabase.from('diet_plan_items').delete().eq('id', id).eq('user_id', userId);

        if (error) {
            console.error('Error deleting diet plan item:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json({ message: 'Diet plan item deleted successfully' });
    } catch (error) {
        console.error('Error deleting diet plan item:', error);
        return NextResponse.json({ error: 'Failed to delete diet plan item' }, { status: 500 });
    }
}
