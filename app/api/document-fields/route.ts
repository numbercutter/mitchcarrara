import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('document_fields')
            .insert({
                document_id: body.document_id,
                label: body.label,
                value: body.value,
                is_secret: body.is_secret || false,
                field_type: body.field_type || 'text',
                field_order: body.field_order || 0,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating document field:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/documents');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating document field:', error);
        return NextResponse.json({ error: 'Failed to create document field' }, { status: 500 });
    }
}
