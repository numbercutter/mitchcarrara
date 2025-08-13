'use server';

import { createClient } from '@/lib/supabase/server';

import { Tables, TablesInsert, TablesUpdate } from '@/types/database';
import { revalidatePath } from 'next/cache';

// Type helpers
type TaskInsert = TablesInsert<'tasks'>;
type TaskUpdate = TablesUpdate<'tasks'>;
type VisionCardInsert = TablesInsert<'vision_cards'>;
type VisionCardUpdate = TablesUpdate<'vision_cards'>;
type TaskChatMessageInsert = TablesInsert<'task_chat_messages'>;
type HealthMetricInsert = TablesInsert<'health_metrics'>;
type WorkoutLogInsert = TablesInsert<'workout_logs'>;
type PersonalActivityInsert = TablesInsert<'personal_activities'>;

// =============================================
// TASK ACTIONS
// =============================================

export async function createTask(userId: string, task: Omit<TaskInsert, 'user_id'>): Promise<{ success: boolean; error?: string; data?: Tables<'tasks'> }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                ...task,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/tasks');
        return { success: true, data };
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, error: 'Failed to create task' };
    }
}

export async function updateTask(taskId: string, updates: TaskUpdate): Promise<{ success: boolean; error?: string; data?: Tables<'tasks'> }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('tasks')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/tasks');
        return { success: true, data };
    } catch (error) {
        console.error('Error updating task:', error);
        return { success: false, error: 'Failed to update task' };
    }
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase.from('tasks').delete().eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/tasks');
        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, error: 'Failed to delete task' };
    }
}

export async function createTaskChatMessage(
    userId: string,
    message: Omit<TaskChatMessageInsert, 'user_id'>
): Promise<{ success: boolean; error?: string; data?: Tables<'task_chat_messages'> }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('task_chat_messages')
            .insert({
                ...message,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating chat message:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/tasks');
        return { success: true, data };
    } catch (error) {
        console.error('Error creating chat message:', error);
        return { success: false, error: 'Failed to send message' };
    }
}

// =============================================
// VISION ACTIONS
// =============================================

export async function createVisionCard(userId: string, card: Omit<VisionCardInsert, 'user_id'>): Promise<{ success: boolean; error?: string; data?: Tables<'vision_cards'> }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('vision_cards')
            .insert({
                ...card,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating vision card:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/vision');
        return { success: true, data };
    } catch (error) {
        console.error('Error creating vision card:', error);
        return { success: false, error: 'Failed to create vision card' };
    }
}

export async function updateVisionCard(cardId: string, updates: VisionCardUpdate): Promise<{ success: boolean; error?: string; data?: Tables<'vision_cards'> }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('vision_cards')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', cardId)
            .select()
            .single();

        if (error) {
            console.error('Error updating vision card:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/vision');
        return { success: true, data };
    } catch (error) {
        console.error('Error updating vision card:', error);
        return { success: false, error: 'Failed to update vision card' };
    }
}

export async function deleteVisionCard(cardId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase.from('vision_cards').delete().eq('id', cardId);

        if (error) {
            console.error('Error deleting vision card:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/vision');
        return { success: true };
    } catch (error) {
        console.error('Error deleting vision card:', error);
        return { success: false, error: 'Failed to delete vision card' };
    }
}

// =============================================
// PERSONAL DATA ACTIONS
// =============================================

export async function createHealthMetric(
    userId: string,
    metric: Omit<HealthMetricInsert, 'user_id'>
): Promise<{ success: boolean; error?: string; data?: Tables<'health_metrics'> }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('health_metrics')
            .insert({
                ...metric,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating health metric:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/personal');
        revalidatePath('/dashboard/personal/health');
        return { success: true, data };
    } catch (error) {
        console.error('Error creating health metric:', error);
        return { success: false, error: 'Failed to create health metric' };
    }
}

export async function createWorkoutLog(userId: string, workout: Omit<WorkoutLogInsert, 'user_id'>): Promise<{ success: boolean; error?: string; data?: Tables<'workout_logs'> }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('workout_logs')
            .insert({
                ...workout,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating workout log:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/personal');
        revalidatePath('/dashboard/personal/health');
        return { success: true, data };
    } catch (error) {
        console.error('Error creating workout log:', error);
        return { success: false, error: 'Failed to log workout' };
    }
}

export async function createPersonalActivity(
    userId: string,
    activity: Omit<PersonalActivityInsert, 'user_id'>
): Promise<{ success: boolean; error?: string; data?: Tables<'personal_activities'> }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('personal_activities')
            .insert({
                ...activity,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating personal activity:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/personal');
        return { success: true, data };
    } catch (error) {
        console.error('Error creating personal activity:', error);
        return { success: false, error: 'Failed to create activity' };
    }
}
