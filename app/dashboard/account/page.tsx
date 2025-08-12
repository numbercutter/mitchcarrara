import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountClient from './components/AccountClient';

async function getCurrentUser() {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/auth/login');
    }

    return user;
}

async function getUserProfile(userId: string) {
    const supabase = await createClient();

    const { data: profile, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error fetching user profile:', error);
        return null;
    }

    return profile;
}

export default async function AccountPage() {
    const user = await getCurrentUser();
    const profile = await getUserProfile(user.id);

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-3xl font-bold'>Account Settings</h1>
                <p className='text-muted-foreground'>Manage your personal account information and preferences</p>
            </div>

            <AccountClient user={user} initialProfile={profile} />
        </div>
    );
}
