import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('secure_documents')
            .insert({
                title: body.title,
                category: body.category,
                document_type: body.document_type,
                is_encrypted: body.is_encrypted || false,
                tags: body.tags || [],
                expiry_date: body.expiry_date || null,
                notes: body.notes || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating document:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/documents');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }
}
