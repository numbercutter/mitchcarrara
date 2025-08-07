import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getCompanyConfig } from '@/config/companies';

export async function updateSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const companyId = pathname.split('/')[1];

    if (!companyId) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    try {
        const company = getCompanyConfig(companyId);
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        const supabase = createServerClient(company.supabase.url, company.supabase.anonKey, {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: any) {
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        });

        return response;
    } catch (error) {
        console.error('Error in updateSession:', error);
        throw error; // Let the middleware handle the error
    }
}
