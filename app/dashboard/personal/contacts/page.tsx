import { getDatabaseContext } from '@/lib/database/server-helpers';
import ContactsClient from './components/ContactsClient';

export default async function ContactsPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch contacts from the database
    const { data: contacts } = await supabase.from('contacts').select('*').eq('user_id', userId).order('name', { ascending: true });

    return <ContactsClient initialContacts={contacts || []} />;
}
