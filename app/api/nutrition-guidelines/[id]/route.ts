import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('nutrition_guidelines')
            .update({
                daily_calories: body.daily_calories || null,
                protein_target: body.protein_target || null,
                carbs_target: body.carbs_target || null,
                fat_target: body.fat_target || null,
                water_target: body.water_target || null,
                notes: body.notes || null,
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating nutrition guidelines:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating nutrition guidelines:', error);
        return NextResponse.json({ error: 'Failed to update nutrition guidelines' }, { status: 500 });
    }
}
