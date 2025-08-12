import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { createVisionCard } from '@/lib/database/actions';
import { TablesInsert } from '@/types/database';

export async function POST(request: NextRequest) {
    try {
        const { company, userId } = await getDatabaseContext();
        const body = await request.json();

        const cardData: Omit<TablesInsert<'vision_cards'>, 'user_id'> = {
            card_type: body.card_type,
            title: body.title,
            content: body.content,
            position_x: body.position_x || null,
            position_y: body.position_y || null,
        };

        const result = await createVisionCard(company, userId, cardData);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error creating vision card:', error);
        return NextResponse.json({ error: 'Failed to create vision card' }, { status: 500 });
    }
}
