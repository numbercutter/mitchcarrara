import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('life_audits').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return NextResponse.json(data || null);
    } catch (error) {
        console.error('Error fetching life audit:', error);
        return NextResponse.json({ error: 'Failed to fetch life audit' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        // Check if user already has a life audit
        const { data: existing } = await supabase.from('life_audits').select('id').eq('user_id', userId).single();

        if (existing) {
            // Update existing audit
            const { data, error } = await supabase
                .from('life_audits')
                .update({
                    ...body,
                    user_id: userId,
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json(data);
        } else {
            // Create new audit
            const { data, error } = await supabase
                .from('life_audits')
                .insert({
                    ...body,
                    user_id: userId,
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('Error saving life audit:', error);
        return NextResponse.json({ error: 'Failed to save life audit' }, { status: 500 });
    }
}
