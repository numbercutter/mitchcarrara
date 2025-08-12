'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function createClient() {
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export default function LogoutButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setLoading(true);
        const supabase = createClient();

        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh();
    };

    return (
        <button onClick={handleLogout} disabled={loading} className='text-red-600 hover:text-red-800 disabled:opacity-50'>
            {loading ? 'Signing out...' : 'Sign out'}
        </button>
    );
}
