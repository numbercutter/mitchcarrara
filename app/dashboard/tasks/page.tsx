import { getDatabaseContext } from '@/lib/database/server-helpers';
import TasksClient from './components/TasksClient';

export default async function TasksPage() {
    const { supabase, userId } = await getDatabaseContext();
    
    // Fetch data directly using the Supabase client
    const [tasks, chatMessages] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('task_chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    ]);

    return <TasksClient 
        initialTasks={tasks.data || []} 
        initialChatMessages={chatMessages.data || []} 
    />;
}
