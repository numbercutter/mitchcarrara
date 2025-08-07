import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('isAuthenticated')?.value === 'true';
    return new NextResponse(null, { status: isAuthenticated ? 200 : 401 });
}
