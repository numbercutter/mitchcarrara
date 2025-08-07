import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip middleware for API routes
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Handle dashboard routes
    if (pathname.startsWith('/dashboard')) {
        // Get the authentication status from cookies
        const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';

        // If not authenticated and not already on the login page, redirect to login
        if (!isAuthenticated && !pathname.startsWith('/login')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*'],
};
