import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('life_audit_weights').select('*').eq('user_id', userId).single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return NextResponse.json(data || null);
    } catch (error) {
        console.error('Error fetching life audit weights:', error);
        return NextResponse.json({ error: 'Failed to fetch life audit weights' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        // Validate that weights sum to 1.0 (within a small tolerance)
        const weightSum = Object.values(body).reduce((sum: number, weight: any) => sum + (typeof weight === 'number' ? weight : 0), 0);

        if (Math.abs(weightSum - 1.0) > 0.01) {
            return NextResponse.json({ error: 'Weights must sum to 1.0' }, { status: 400 });
        }

        // Check if user already has weights
        const { data: existing } = await supabase.from('life_audit_weights').select('id').eq('user_id', userId).single();

        if (existing) {
            // Update existing weights
            const { data, error } = await supabase
                .from('life_audit_weights')
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
            // Create new weights
            const { data, error } = await supabase
                .from('life_audit_weights')
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
        console.error('Error saving life audit weights:', error);
        return NextResponse.json({ error: 'Failed to save life audit weights' }, { status: 500 });
    }
}
