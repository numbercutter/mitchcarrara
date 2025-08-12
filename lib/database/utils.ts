import { Tables } from '@/types/database';

// Type helpers
type Task = Tables<'tasks'>;
type HealthMetric = Tables<'health_metrics'>;
type WorkoutLog = Tables<'workout_logs'>;
type Book = Tables<'books'>;
type PersonalActivity = Tables<'personal_activities'>;

// =============================================
// CALCULATION HELPERS
// =============================================

export function calculateTaskStats(tasks: Task[]) {
    const backlog = tasks.filter((t) => t.status === 'backlog').length;
    const todo = tasks.filter((t) => t.status === 'todo' || t.status === null).length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const inReview = tasks.filter((t) => t.status === 'in-review').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const total = tasks.length;

    return {
        backlog,
        todo,
        inProgress,
        inReview,
        done,
        total,
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
}

export function calculateHealthStats(healthMetrics: HealthMetric[]) {
    if (healthMetrics.length === 0) {
        return {
            averageSleep: 0,
            averageSteps: 0,
            averageWaterIntake: 0,
            latestWeight: null,
            weightTrend: 'stable' as 'up' | 'down' | 'stable',
        };
    }

    const validSleep = healthMetrics.filter((m) => m.sleep_hours !== null);
    const validSteps = healthMetrics.filter((m) => m.steps !== null);
    const validWater = healthMetrics.filter((m) => m.water_intake !== null);
    const validWeight = healthMetrics.filter((m) => m.weight !== null).sort((a, b) => new Date(b.metric_date || '').getTime() - new Date(a.metric_date || '').getTime());

    const averageSleep = validSleep.length > 0 ? validSleep.reduce((sum, m) => sum + (m.sleep_hours || 0), 0) / validSleep.length : 0;

    const averageSteps = validSteps.length > 0 ? validSteps.reduce((sum, m) => sum + (m.steps || 0), 0) / validSteps.length : 0;

    const averageWaterIntake = validWater.length > 0 ? validWater.reduce((sum, m) => sum + (m.water_intake || 0), 0) / validWater.length : 0;

    const latestWeight = validWeight.length > 0 ? validWeight[0].weight : null;

    // Calculate weight trend
    let weightTrend: 'up' | 'down' | 'stable' = 'stable';
    if (validWeight.length >= 2) {
        const recent = validWeight[0].weight || 0;
        const previous = validWeight[1].weight || 0;
        const difference = recent - previous;
        if (difference > 0.5) weightTrend = 'up';
        else if (difference < -0.5) weightTrend = 'down';
    }

    return {
        averageSleep: Math.round(averageSleep * 10) / 10,
        averageSteps: Math.round(averageSteps),
        averageWaterIntake: Math.round(averageWaterIntake * 10) / 10,
        latestWeight,
        weightTrend,
    };
}

export function calculateWorkoutStats(workoutLogs: WorkoutLog[]) {
    if (workoutLogs.length === 0) {
        return {
            totalWorkouts: 0,
            averageDuration: 0,
            averageIntensity: 0,
            streak: 0,
            mostRecentWorkout: null,
        };
    }

    const totalWorkouts = workoutLogs.length;
    const validDuration = workoutLogs.filter((w) => w.duration !== null);
    const validIntensity = workoutLogs.filter((w) => w.intensity !== null);

    const averageDuration = validDuration.length > 0 ? validDuration.reduce((sum, w) => sum + (w.duration || 0), 0) / validDuration.length : 0;

    const averageIntensity = validIntensity.length > 0 ? validIntensity.reduce((sum, w) => sum + (w.intensity || 0), 0) / validIntensity.length : 0;

    // Calculate streak (consecutive days with workouts)
    const sortedWorkouts = workoutLogs.filter((w) => w.workout_date).sort((a, b) => new Date(b.workout_date || '').getTime() - new Date(a.workout_date || '').getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedWorkouts.length; i++) {
        const workoutDate = new Date(sortedWorkouts[i].workout_date || '');
        workoutDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (workoutDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }

    return {
        totalWorkouts,
        averageDuration: Math.round(averageDuration),
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        streak,
        mostRecentWorkout: sortedWorkouts[0] || null,
    };
}

export function calculateReadingStats(books: Book[]) {
    const completed = books.filter((b) => b.status === 'completed');
    const inProgress = books.filter((b) => b.status === 'reading' || b.status === 'in-progress');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const booksThisMonth = completed.filter((book) => {
        if (!book.completion_date) return false;
        const completionDate = new Date(book.completion_date);
        return completionDate.getMonth() === currentMonth && completionDate.getFullYear() === currentYear;
    }).length;

    const currentlyReading = inProgress[0] || null;
    let readingProgress = 0;

    if (currentlyReading && currentlyReading.current_page && currentlyReading.total_pages) {
        readingProgress = Math.round((currentlyReading.current_page / currentlyReading.total_pages) * 100);
    }

    return {
        totalCompleted: completed.length,
        booksThisMonth,
        currentlyReading,
        readingProgress,
        inProgress: inProgress.length,
    };
}

export function getRecentActivities(activities: PersonalActivity[], limit = 5) {
    return activities.sort((a, b) => new Date(b.activity_date || '').getTime() - new Date(a.activity_date || '').getTime()).slice(0, limit);
}

// =============================================
// DATA FORMATTERS
// =============================================

export function formatDate(dateString: string | null): string {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
}

export function formatDateTime(dateString: string | null): string {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleString();
}

export function formatTimeAgo(dateString: string | null): string {
    if (!dateString) return 'No date';

    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
        return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    } else if (diffInHours > 0) {
        return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInMinutes > 0) {
        return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    } else {
        return 'Just now';
    }
}

export function getPriorityColor(priority: string | null): string {
    switch (priority) {
        case 'high':
            return 'text-red-600 bg-red-100 dark:bg-red-900/20';
        case 'medium':
            return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
        case 'low':
            return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
        default:
            return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
}

export function getStatusColor(status: string | null): string {
    switch (status) {
        case 'done':
            return 'text-green-600 bg-green-100 dark:bg-green-900/20';
        case 'in-progress':
            return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
        case 'in-review':
            return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
        case 'todo':
            return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
        case 'backlog':
            return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
        default:
            return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
}
