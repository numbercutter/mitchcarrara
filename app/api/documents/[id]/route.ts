import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('secure_documents')
            .update({
                title: body.title,
                category: body.category,
                document_type: body.document_type,
                is_encrypted: body.is_encrypted,
                tags: body.tags,
                expiry_date: body.expiry_date,
                notes: body.notes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating document:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/documents');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { supabase, userId } = await getDatabaseContext();

        // First delete all document fields
        await supabase.from('document_fields').delete().eq('document_id', params.id).eq('user_id', userId);

        // Then delete the document
        const { error } = await supabase.from('secure_documents').delete().eq('id', params.id).eq('user_id', userId);

        if (error) {
            console.error('Error deleting document:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/documents');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
