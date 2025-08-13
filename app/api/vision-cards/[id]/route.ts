import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { TablesUpdate } from '@/types/database';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase } = await getDatabaseContext();
        const body = await request.json();
        const { id: cardId } = await params;

        const updateData: TablesUpdate<'vision_cards'> = {};

        // Only include fields that are being updated
        if (body.title !== undefined) updateData.title = body.title;
        if (body.content !== undefined) updateData.content = body.content;
        if (body.card_type !== undefined) updateData.card_type = body.card_type;
        if (body.position_x !== undefined) updateData.position_x = body.position_x;
        if (body.position_y !== undefined) updateData.position_y = body.position_y;

        const { data, error } = await supabase
            .from('vision_cards')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', cardId)
            .select()
            .single();

        if (error) {
            console.error('Error updating vision card:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating vision card:', error);
        return NextResponse.json({ error: 'Failed to update vision card' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase } = await getDatabaseContext();
        const { id: cardId } = await params;

        const { error } = await supabase.from('vision_cards').delete().eq('id', cardId);

        if (error) {
            console.error('Error deleting vision card:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting vision card:', error);
        return NextResponse.json({ error: 'Failed to delete vision card' }, { status: 500 });
    }
}
