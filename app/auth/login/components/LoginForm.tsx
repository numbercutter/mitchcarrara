'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

function createClient() {
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const supabase = createClient();

        try {
            const redirectUrl =
                process.env.NODE_ENV === 'development'
                    ? `${window.location.origin}/api/auth/callback?next=/dashboard/personal`
                    : `https://mitchcarrara.com/api/auth/callback?next=/dashboard/personal`;

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: redirectUrl,
                    shouldCreateUser: true,
                },
            });

            if (error) throw error;

            setSuccess('Check your email for a magic link to sign in!');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className='mt-8 space-y-6' onSubmit={handleMagicLink}>
            <div className='rounded-md shadow-sm'>
                <div>
                    <input
                        type='email'
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
                        placeholder='Email address'
                        disabled={loading}
                    />
                </div>
            </div>

            {error && <div className='text-center text-sm text-red-600'>{error}</div>}
            {success && <div className='text-center text-sm text-green-600'>{success}</div>}

            <div>
                <button
                    type='submit'
                    disabled={loading || !!success}
                    className='group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50'>
                    {loading ? 'Sending magic link...' : success ? 'Magic link sent!' : 'Send magic link'}
                </button>
            </div>

            <div className='text-center text-sm text-gray-600'>Enter your email address and we'll send you a magic link to sign in.</div>
        </form>
    );
}
