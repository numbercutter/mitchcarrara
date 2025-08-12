import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    // Default to dashboard after successful login
    const next = searchParams.get('next') ?? '/dashboard';

    console.log('🔥 Auth callback hit!');
    console.log('Auth callback URL:', request.url);
    console.log('Auth callback params:', { code, token, type, next });

    if (code) {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            console.log('Auth exchange result:', { data: data?.user?.email, error });

            if (!error && data.user) {
                const forwardedHost = request.headers.get('x-forwarded-host');
                const isLocalEnv = process.env.NODE_ENV === 'development';

                console.log('Auth successful, redirecting to:', next);

                if (isLocalEnv) {
                    return NextResponse.redirect(`${origin}${next}`);
                } else if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`);
                } else {
                    return NextResponse.redirect(`${origin}${next}`);
                }
            } else {
                console.error('Auth exchange failed:', error);
            }
        } catch (authError) {
            console.error('Auth callback error:', authError);
        }
    } else if (token && type === 'magiclink') {
        // Handle PKCE magic link
        try {
            const supabase = await createClient();
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'email',
            });

            console.log('PKCE Magic link verification result:', { data: data?.user?.email, error });

            if (!error && data.user) {
                console.log('PKCE Magic link auth successful, redirecting to:', next);
                return NextResponse.redirect(`${origin}${next}`);
            } else {
                console.error('PKCE Magic link verification failed:', error);
            }
        } catch (magicLinkError) {
            console.error('PKCE Magic link error:', magicLinkError);
        }
    }

    console.log('Auth failed, redirecting to error page');
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
