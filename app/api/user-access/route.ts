import { NextRequest, NextResponse } from 'next/server';
import { grantUserAccess, revokeUserAccess } from '@/lib/database/access-control';

export async function POST(request: NextRequest) {
    try {
        const { action, email, accessLevel } = await request.json();

        if (action === 'grant') {
            const result = await grantUserAccess(email, accessLevel);
            return NextResponse.json(result);
        } else if (action === 'revoke') {
            const result = await revokeUserAccess(email);
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('User access API error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
