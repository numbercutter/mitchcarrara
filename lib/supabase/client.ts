import { createBrowserClient } from '@supabase/ssr';
import { CompanyConfig } from '@/config/companies';

export function createClient(company: CompanyConfig) {
    return createBrowserClient(company.supabase.url, company.supabase.anonKey);
}
