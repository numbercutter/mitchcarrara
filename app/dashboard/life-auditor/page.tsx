import { getDatabaseContext } from '@/lib/database/server-helpers';
import LifeAuditorClient from './components/LifeAuditorClient';

export default async function LifeAuditorPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch current audit data
    const { data: currentAudit } = await supabase.from('life_audits').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).maybeSingle();

    // Fetch audit history for charts
    const { data: auditHistory } = await supabase.from('life_audit_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);

    // Fetch user weights
    const { data: weights } = await supabase.from('life_audit_weights').select('*').eq('user_id', userId).maybeSingle();

    return <LifeAuditorClient initialAudit={currentAudit} initialHistory={auditHistory || []} initialWeights={weights} />;
}
