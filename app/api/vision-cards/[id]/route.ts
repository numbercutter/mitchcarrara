import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { updateVisionCard, deleteVisionCard } from '@/lib/database/actions';
import { TablesUpdate } from '@/types/database';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { company } = await getDatabaseContext();
        const body = await request.json();
        const cardId = params.id;

        const updateData: TablesUpdate<'vision_cards'> = {};

        // Only include fields that are being updated
        if (body.title !== undefined) updateData.title = body.title;
        if (body.content !== undefined) updateData.content = body.content;
        if (body.card_type !== undefined) updateData.card_type = body.card_type;
        if (body.position_x !== undefined) updateData.position_x = body.position_x;
        if (body.position_y !== undefined) updateData.position_y = body.position_y;

        const result = await updateVisionCard(company, cardId, updateData);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error updating vision card:', error);
        return NextResponse.json({ error: 'Failed to update vision card' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { company } = await getDatabaseContext();
        const cardId = params.id;

        const result = await deleteVisionCard(company, cardId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting vision card:', error);
        return NextResponse.json({ error: 'Failed to delete vision card' }, { status: 500 });
    }
}
