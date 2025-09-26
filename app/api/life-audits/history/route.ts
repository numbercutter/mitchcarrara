import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET() {
    try {
        const { supabase, userId } = await getDatabaseContext();

        const { data, error } = await supabase.from('life_audit_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Error fetching life audit history:', error);
        return NextResponse.json({ error: 'Failed to fetch life audit history' }, { status: 500 });
    }
}
