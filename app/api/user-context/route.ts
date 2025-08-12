import { NextResponse } from 'next/server';
import { getDisplayContext } from '@/lib/database/data-owner';

export async function GET() {
    try {
        const context = await getDisplayContext();
        return NextResponse.json(context);
    } catch (error) {
        console.error('Error getting user context:', error);
        return NextResponse.json({ error: 'Failed to get user context' }, { status: 500 });
    }
}
