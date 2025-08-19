import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        console.log('Creating vision card with userId:', userId);
        console.log('Request body:', body);

        const { data, error } = await supabase
            .from('vision_cards')
            .insert({
                card_type: body.card_type,
                title: body.title,
                content: body.content,
                position_x: body.position_x || null,
                position_y: body.position_y || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating vision card:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        console.log('Successfully created vision card:', data);
        revalidatePath('/dashboard/vision');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating vision card:', error);
        return NextResponse.json({ error: 'Failed to create vision card' }, { status: 500 });
    }
}
