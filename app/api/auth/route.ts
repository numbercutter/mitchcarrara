import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const correctPassword = process.env.ADMIN_PASSWORD;

        if (!correctPassword) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (password === correctPassword) {
            // Set HTTP-only cookie for security
            const response = NextResponse.json({ success: true });
            response.cookies.set('isAuthenticated', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });
            return response;
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('isAuthenticated');
    return response;
}
