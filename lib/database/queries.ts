import { createClient } from '@/lib/supabase/server';

import { Database, Tables } from '@/types/database';

// Type helpers
type Task = Tables<'tasks'>;
type VisionCard = Tables<'vision_cards'>;
type Contact = Tables<'contacts'>;
type HealthMetric = Tables<'health_metrics'>;
type WorkoutLog = Tables<'workout_logs'>;
type Book = Tables<'books'>;
type Course = Tables<'courses'>;
type Meal = Tables<'meals'>;
type Supplement = Tables<'supplements'>;
type TaskChatMessage = Tables<'task_chat_messages'>;
type CalendarEvent = Tables<'calendar_events'>;
type PersonalActivity = Tables<'personal_activities'>;
type DailyRoutine = Tables<'daily_routines'>;
type RoutineItem = Tables<'routine_items'>;

// =============================================
// TASKS QUERIES
// =============================================

export async function getTasks(userId: string): Promise<Task[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }

    return data || [];
}

export async function getTaskChatMessages(userId: string): Promise<TaskChatMessage[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('task_chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching task chat messages:', error);
        return [];
    }

    return data || [];
}

export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('calendar_events').select('*').eq('user_id', userId).order('start_datetime', { ascending: true });

    if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }

    return data || [];
}

// =============================================
// VISION QUERIES
// =============================================

export async function getVisionCards(userId: string): Promise<VisionCard[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('vision_cards').select('*').eq('user_id', userId).order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching vision cards:', error);
        return [];
    }

    return data || [];
}

// =============================================
// PERSONAL QUERIES
// =============================================

export async function getHealthMetrics(userId: string, limit = 30): Promise<HealthMetric[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('health_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: false }).limit(limit);

    if (error) {
        console.error('Error fetching health metrics:', error);
        return [];
    }

    return data || [];
}

export async function getWorkoutLogs(userId: string, limit = 10): Promise<WorkoutLog[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('workout_logs').select('*').eq('user_id', userId).order('workout_date', { ascending: false }).limit(limit);

    if (error) {
        console.error('Error fetching workout logs:', error);
        return [];
    }

    return data || [];
}

export async function getBooks(userId: string): Promise<Book[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('books').select('*').eq('user_id', userId).order('start_date', { ascending: false });

    if (error) {
        console.error('Error fetching books:', error);
        return [];
    }

    return data || [];
}

export async function getCourses(userId: string): Promise<Course[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('courses').select('*').eq('user_id', userId).order('start_date', { ascending: false });

    if (error) {
        console.error('Error fetching courses:', error);
        return [];
    }

    return data || [];
}

export async function getContacts(userId: string): Promise<Contact[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('contacts').select('*').eq('user_id', userId).order('name', { ascending: true });

    if (error) {
        console.error('Error fetching contacts:', error);
        return [];
    }

    return data || [];
}

export async function getRecentPersonalActivities(userId: string, limit = 10): Promise<PersonalActivity[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('personal_activities').select('*').eq('user_id', userId).order('activity_date', { ascending: false }).limit(limit);

    if (error) {
        console.error('Error fetching personal activities:', error);
        return [];
    }

    return data || [];
}

export async function getMeals(userId: string, limit = 20): Promise<Meal[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('meals').select('*').eq('user_id', userId).order('meal_date', { ascending: false }).limit(limit);

    if (error) {
        console.error('Error fetching meals:', error);
        return [];
    }

    return data || [];
}

export async function getSupplements(userId: string): Promise<Supplement[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('supplements').select('*').eq('user_id', userId).eq('is_active', true).order('name', { ascending: true });

    if (error) {
        console.error('Error fetching supplements:', error);
        return [];
    }

    return data || [];
}

export async function getDailyRoutines(userId: string): Promise<DailyRoutine[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('daily_routines').select('*').eq('user_id', userId).eq('is_active', true).order('name', { ascending: true });

    if (error) {
        console.error('Error fetching daily routines:', error);
        return [];
    }

    return data || [];
}

export async function getRoutineItems(userId: string, routineId: string): Promise<RoutineItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('routine_items').select('*').eq('routine_id', routineId).eq('user_id', userId).order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching routine items:', error);
        return [];
    }

    return data || [];
}

// =============================================
// AGGREGATE DATA FUNCTIONS
// =============================================

export async function getPersonalDashboardData(userId: string) {
    const [healthMetrics, workoutLogs, books, courses, recentActivities, meals, supplements] = await Promise.all([
        getHealthMetrics(userId, 7), // Last 7 days
        getWorkoutLogs(userId, 5), // Last 5 workouts
        getBooks(userId),
        getCourses(userId),
        getRecentPersonalActivities(userId, 5),
        getMeals(userId, 10), // Last 10 meals
        getSupplements(userId),
    ]);

    return {
        healthMetrics,
        workoutLogs,
        books,
        courses,
        recentActivities,
        meals,
        supplements,
    };
}

export async function getTasksDashboardData(userId: string) {
    const [tasks, chatMessages, calendarEvents] = await Promise.all([getTasks(userId), getTaskChatMessages(userId), getCalendarEvents(userId)]);

    return {
        tasks,
        chatMessages,
        calendarEvents,
    };
}

export async function getVisionDashboardData(userId: string) {
    const visionCards = await getVisionCards(userId);

    return {
        visionCards,
    };
}
