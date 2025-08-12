import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    console.log('🚦 Middleware hit:', request.nextUrl.pathname);

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                response = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If user is not signed in and the current path is not /auth/login, redirect the user to /auth/login
    // BUT exclude the auth callback route so it can process the magic link
    if (!user && !request.nextUrl.pathname.startsWith('/auth') && !request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If user is signed in and the current path is /auth/login, redirect the user to /dashboard/personal
    if (user && request.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/dashboard/personal', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
