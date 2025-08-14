import { Calendar, Heart, Dumbbell, Book, MapPin, Clock, TrendingUp } from 'lucide-react';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { calculateHealthStats, calculateWorkoutStats, calculateReadingStats, getRecentActivities } from '@/lib/database/utils';

export default async function PersonalPage() {
    const { supabase, userId } = await getDatabaseContext();

    // Fetch data directly using the Supabase client
    const [healthMetricsResponse, workoutLogsResponse, booksResponse, coursesResponse, activitiesResponse, mealsResponse, supplementsResponse] = await Promise.all([
        supabase.from('health_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: false }).limit(7),
        supabase.from('workout_logs').select('*').eq('user_id', userId).order('workout_date', { ascending: false }).limit(5),
        supabase.from('books').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
        supabase.from('courses').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
        supabase.from('personal_activities').select('*').eq('user_id', userId).order('activity_date', { ascending: false }).limit(5),
        supabase.from('meals').select('*').eq('user_id', userId).order('meal_date', { ascending: false }).limit(10),
        supabase.from('supplements').select('*').eq('user_id', userId).eq('is_active', true).order('name', { ascending: true }),
    ]);

    const data = {
        healthMetrics: healthMetricsResponse.data || [],
        workoutLogs: workoutLogsResponse.data || [],
        books: booksResponse.data || [],
        courses: coursesResponse.data || [],
        recentActivities: activitiesResponse.data || [],
        meals: mealsResponse.data || [],
        supplements: supplementsResponse.data || [],
    };

    // Calculate derived stats
    const healthStats = calculateHealthStats(data.healthMetrics);
    const workoutStats = calculateWorkoutStats(data.workoutLogs);
    const readingStats = calculateReadingStats(data.books);
    const recentActivities = getRecentActivities(data.recentActivities, 4);

    return (
        <div className='flex h-full flex-col'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm pb-6'>
                <div>
                    <h1 className='text-3xl font-bold'>Personal Life</h1>
                    <p className='mt-2 text-muted-foreground'>Track your personal goals, habits, and well-being.</p>
                </div>

                {/* Quick Stats - Always visible */}
                <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                <div className='rounded-lg border bg-card p-6'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-green-100 p-2 dark:bg-green-900/20'>
                            <Dumbbell className='h-5 w-5 text-green-600 dark:text-green-400' />
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Workout Streak</p>
                            <p className='text-2xl font-bold'>{workoutStats.streak} days</p>
                        </div>
                    </div>
                </div>

                <div className='rounded-lg border bg-card p-6'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-blue-100 p-2 dark:bg-blue-900/20'>
                            <Book className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Books This Month</p>
                            <p className='text-2xl font-bold'>{readingStats.booksThisMonth}</p>
                        </div>
                    </div>
                </div>

                <div className='rounded-lg border bg-card p-6'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-purple-100 p-2 dark:bg-purple-900/20'>
                            <Clock className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Sleep Average</p>
                            <p className='text-2xl font-bold'>{healthStats.averageSleep}h</p>
                        </div>
                    </div>
                </div>

                <div className='rounded-lg border bg-card p-6'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-orange-100 p-2 dark:bg-orange-900/20'>
                            <TrendingUp className='h-5 w-5 text-orange-600 dark:text-orange-400' />
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Avg Steps</p>
                            <p className='text-2xl font-bold'>{healthStats.averageSteps.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            
            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto pt-6'>
            {/* Main Content Grid */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                {/* Health & Fitness */}
                <div className='rounded-lg border bg-card p-6'>
                    <div className='mb-4 flex items-center gap-2'>
                        <Dumbbell className='h-5 w-5 text-green-600 dark:text-green-400' />
                        <h3 className='font-semibold'>Health & Fitness</h3>
                    </div>
                    <div className='space-y-3'>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>Recent Workout</span>
                            <span className='text-sm font-medium text-green-600'>{workoutStats.mostRecentWorkout ? workoutStats.mostRecentWorkout.name : 'No workouts yet'}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>Avg Steps</span>
                            <span className='text-sm'>{healthStats.averageSteps.toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>Water Intake</span>
                            <span className='text-sm'>{healthStats.averageWaterIntake}L avg</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>Total Workouts</span>
                            <span className='text-sm'>{workoutStats.totalWorkouts}</span>
                        </div>
                        {workoutStats.streak > 0 && (
                            <div className='w-full rounded-full bg-secondary'>
                                <div className='h-2 rounded-full bg-green-500' style={{ width: `${Math.min(workoutStats.streak * 10, 100)}%` }}></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Learning & Growth */}
                <div className='rounded-lg border bg-card p-6'>
                    <div className='mb-4 flex items-center gap-2'>
                        <Book className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                        <h3 className='font-semibold'>Learning & Growth</h3>
                    </div>
                    <div className='space-y-3'>
                        {readingStats.currentlyReading ? (
                            <div>
                                <p className='text-sm text-muted-foreground'>Currently Reading</p>
                                <p className='text-sm font-medium'>{readingStats.currentlyReading.title}</p>
                                {readingStats.currentlyReading.author && <p className='text-xs text-muted-foreground'>by {readingStats.currentlyReading.author}</p>}
                                {readingStats.readingProgress > 0 && (
                                    <div className='mt-1 w-full rounded-full bg-secondary'>
                                        <div className='h-1.5 rounded-full bg-blue-500' style={{ width: `${readingStats.readingProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p className='text-sm text-muted-foreground'>Currently Reading</p>
                                <p className='text-sm'>No active book</p>
                            </div>
                        )}

                        <div className='space-y-2'>
                            <p className='text-sm text-muted-foreground'>Reading Stats</p>
                            <div className='text-sm'>
                                <p>• Total completed: {readingStats.totalCompleted}</p>
                                <p>• This month: {readingStats.booksThisMonth}</p>
                                <p>• In progress: {readingStats.inProgress}</p>
                            </div>
                        </div>

                        {data.courses.length > 0 && (
                            <div className='space-y-2'>
                                <p className='text-sm text-muted-foreground'>Recent Courses</p>
                                <div className='text-sm'>
                                    {data.courses.slice(0, 3).map((course) => (
                                        <p key={course.id}>• {course.title}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className='rounded-lg border bg-card p-6'>
                    <div className='mb-4 flex items-center gap-2'>
                        <Heart className='h-5 w-5 text-red-500' />
                        <h3 className='font-semibold'>Recent Activity</h3>
                    </div>
                    <div className='space-y-3'>
                        {data.recentActivities.length > 0 ? (
                            data.recentActivities.map((activity) => (
                                <div key={activity.id}>
                                    <p className='text-sm font-medium'>{activity.title}</p>
                                    <p className='text-xs text-muted-foreground'>
                                        {activity.activity_type} • {activity.activity_date}
                                    </p>
                                    {activity.description && <p className='mt-1 text-xs text-muted-foreground'>{activity.description}</p>}
                                </div>
                            ))
                        ) : (
                            <div>
                                <p className='text-sm text-muted-foreground'>No recent activities</p>
                                <p className='text-xs text-muted-foreground'>Start tracking your personal activities!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className='rounded-lg border bg-card p-6'>
                <h3 className='mb-4 font-semibold'>Activity Timeline</h3>
                <div className='space-y-3'>
                    {data.recentActivities.length > 0 ? (
                        data.recentActivities.map((activity) => {
                            const activityIcon =
                                activity.activity_type === 'workout'
                                    ? Dumbbell
                                    : activity.activity_type === 'reading'
                                      ? Book
                                      : activity.activity_type === 'social'
                                        ? Heart
                                        : MapPin;

                            const activityColor =
                                activity.activity_type === 'workout'
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                    : activity.activity_type === 'reading'
                                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                      : activity.activity_type === 'social'
                                        ? 'bg-red-100 text-red-500 dark:bg-red-900/20'
                                        : 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';

                            const ActivityIcon = activityIcon;

                            return (
                                <div key={activity.id} className='flex items-center gap-3'>
                                    <div className={`rounded-full p-1.5 ${activityColor}`}>
                                        <ActivityIcon className='h-3 w-3' />
                                    </div>
                                    <div className='flex-1'>
                                        <p className='text-sm'>{activity.title}</p>
                                        <p className='text-xs text-muted-foreground'>
                                            {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : 'No date'}
                                        </p>
                                        {activity.description && <p className='mt-1 text-xs text-muted-foreground'>{activity.description}</p>}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className='py-8 text-center'>
                            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50'>
                                <Calendar className='h-6 w-6 text-muted-foreground' />
                            </div>
                            <p className='text-sm text-muted-foreground'>No recent activities</p>
                            <p className='mt-1 text-xs text-muted-foreground'>Your personal activities will appear here</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}
