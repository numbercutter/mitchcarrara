import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('health_goals')
            .update({
                category: body.category,
                title: body.title,
                description: body.description || null,
                current_value: body.current_value || null,
                target_value: body.target_value || null,
                status: body.status || 'active',
                priority: body.priority || 2,
                target_date: body.target_date || null,
                notes: body.notes || null,
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating health goal:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating health goal:', error);
        return NextResponse.json({ error: 'Failed to update health goal' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { supabase, userId } = await getDatabaseContext();

        const { error } = await supabase.from('health_goals').delete().eq('id', id).eq('user_id', userId);

        if (error) {
            console.error('Error deleting health goal:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json({ message: 'Health goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting health goal:', error);
        return NextResponse.json({ error: 'Failed to delete health goal' }, { status: 500 });
    }
}
