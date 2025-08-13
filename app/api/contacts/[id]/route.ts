import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();
        const { id } = await params;

        const { data, error } = await supabase
            .from('contacts')
            .update({
                name: body.name,
                email: body.email,
                phone: body.phone,
                birthday: body.birthday,
                address: body.address,
                relationship: body.relationship,
                company: body.company,
                position: body.position,
                notes: body.notes,
                tags: body.tags,
                last_contact: body.last_contact,
                social_media: body.social_media,
                preferences: body.preferences,
                important_dates: body.important_dates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating contact:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/contacts');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating contact:', error);
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const { id } = await params;

        const { error } = await supabase.from('contacts').delete().eq('id', id).eq('user_id', userId);

        if (error) {
            console.error('Error deleting contact:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/contacts');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contact:', error);
        return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }
}
