import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('contacts')
            .insert({
                name: body.name,
                email: body.email || null,
                phone: body.phone || null,
                birthday: body.birthday || null,
                address: body.address || null,
                relationship: body.relationship || 'other',
                company: body.company || null,
                position: body.position || null,
                notes: body.notes || null,
                tags: body.tags || [],
                last_contact: body.last_contact || null,
                social_media: body.social_media || null,
                preferences: body.preferences || null,
                important_dates: body.important_dates || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating contact:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/contacts');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating contact:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}
