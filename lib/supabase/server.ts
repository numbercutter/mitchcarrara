import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CompanyConfig } from '@/config/companies';

export async function createClient(company: CompanyConfig) {
    const cookieStore = await cookies();

    return createServerClient(company.supabase.url, company.supabase.anonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        },
    });
}
