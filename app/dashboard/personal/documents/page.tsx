import { getDatabaseContext } from '@/lib/database/server-helpers';
import DocumentsClient from './components/DocumentsClient';

export default async function DocumentsPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch documents and their fields from the database
    const [documentsResponse, fieldsResponse] = await Promise.all([
        supabase.from('secure_documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('document_fields').select('*').eq('user_id', userId).order('field_order', { ascending: true }),
    ]);

    const documents = documentsResponse.data || [];
    const fields = fieldsResponse.data || [];

    // Group fields by document_id
    const documentsWithFields = documents.map((doc) => ({
        ...doc,
        fields: fields.filter((field) => field.document_id === doc.id),
    }));

    return <DocumentsClient initialDocuments={documentsWithFields} />;
}
