import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { UserPreferences } from '@/database';

const PRIMARY_DATA_OWNER_EMAIL = 'numbercutter@protonmail.com';

async function handleSharedAccessOnLogin(userId: string, email: string) {
    try {
        const supabase = await createClient();
        
        // Check if this user has been granted shared access by the primary owner
        // Get primary owner's profile
        const { data: primaryOwnerProfile } = await supabase
            .from('user_profiles')
            .select('user_id, preferences')
            .contains('preferences', { shared_access: [{ email }] });

        if (primaryOwnerProfile && primaryOwnerProfile.length > 0) {
            // Find the primary owner (the one whose email matches PRIMARY_DATA_OWNER_EMAIL)
            for (const profile of primaryOwnerProfile) {
                const preferences = profile.preferences as UserPreferences;
                const sharedAccess = preferences?.shared_access || [];
                
                // Check if this email has been granted access
                const accessGrant = sharedAccess.find(access => access.email === email);
                if (accessGrant && !accessGrant.user_id) {
                    // Update the shared access with the actual user_id
                    const updatedSharedAccess = sharedAccess.map(access => 
                        access.email === email ? { ...access, user_id: userId } : access
                    );
                    
                    await supabase
                        .from('user_profiles')
                        .update({
                            preferences: {
                                ...preferences,
                                shared_access: updatedSharedAccess
                            }
                        })
                        .eq('user_id', profile.user_id);

                    // Set this user's shared_access_to field
                    await supabase
                        .from('user_profiles')
                        .upsert({
                            user_id: userId,
                            preferences: {
                                shared_access_to: profile.user_id
                            }
                        });

                    console.log(`Shared access set up for ${email} to access ${profile.user_id}`);
                }
            }
        }
    } catch (error) {
        console.error('Error handling shared access on login:', error);
    }
}

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
                // Check if this user has been granted shared access
                await handleSharedAccessOnLogin(data.user.id, data.user.email || '');

                const forwardedHost = request.headers.get('x-forwarded-host');
                const isLocalEnv = process.env.NODE_ENV === 'development';

                console.log('Auth successful, redirecting to:', next);

                // Force mitchcarrara.com in production
                if (isLocalEnv) {
                    return NextResponse.redirect(`${origin}${next}`);
                } else if (forwardedHost?.includes('mitchcarrara.com')) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`);
                } else {
                    // Force redirect to mitchcarrara.com
                    return NextResponse.redirect(`https://mitchcarrara.com${next}`);
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
                // Check if this user has been granted shared access
                await handleSharedAccessOnLogin(data.user.id, data.user.email || '');

                console.log('PKCE Magic link auth successful, redirecting to:', next);
                const isLocalEnv = process.env.NODE_ENV === 'development';

                if (isLocalEnv) {
                    return NextResponse.redirect(`${origin}${next}`);
                } else {
                    // Force redirect to mitchcarrara.com
                    return NextResponse.redirect(`https://mitchcarrara.com${next}`);
                }
            } else {
                console.error('PKCE Magic link verification failed:', error);
            }
        } catch (magicLinkError) {
            console.error('PKCE Magic link error:', magicLinkError);
        }
    }

    console.log('Auth failed, redirecting to error page');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    } else {
        return NextResponse.redirect(`https://mitchcarrara.com/auth/auth-code-error`);
    }
}
