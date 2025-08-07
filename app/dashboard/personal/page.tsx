'use client';

import { Calendar, Heart, Dumbbell, Book, MapPin, Clock, TrendingUp } from 'lucide-react';

export default function PersonalPage() {
    return (
        <div className='space-y-8'>
            <div>
                <h1 className='text-3xl font-bold'>Personal Life</h1>
                <p className='mt-2 text-muted-foreground'>Track your personal goals, habits, and well-being.</p>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                <div className='rounded-lg border bg-card p-6'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-green-100 p-2 dark:bg-green-900/20'>
                            <Dumbbell className='h-5 w-5 text-green-600 dark:text-green-400' />
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Workout Streak</p>
                            <p className='text-2xl font-bold'>12 days</p>
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
                            <p className='text-2xl font-bold'>3</p>
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
                            <p className='text-2xl font-bold'>7.5h</p>
                        </div>
                    </div>
                </div>

                <div className='rounded-lg border bg-card p-6'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-orange-100 p-2 dark:bg-orange-900/20'>
                            <TrendingUp className='h-5 w-5 text-orange-600 dark:text-orange-400' />
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Productivity Score</p>
                            <p className='text-2xl font-bold'>85%</p>
                        </div>
                    </div>
                </div>
            </div>

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
                            <span className='text-sm text-muted-foreground'>Today\'s Workout</span>
                            <span className='text-sm font-medium text-green-600'>Completed</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>Steps</span>
                            <span className='text-sm'>8,432 / 10,000</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>Water Intake</span>
                            <span className='text-sm'>6 / 8 glasses</span>
                        </div>
                        <div className='w-full rounded-full bg-secondary'>
                            <div className='h-2 rounded-full bg-green-500' style={{ width: '84%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Learning & Growth */}
                <div className='rounded-lg border bg-card p-6'>
                    <div className='mb-4 flex items-center gap-2'>
                        <Book className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                        <h3 className='font-semibold'>Learning & Growth</h3>
                    </div>
                    <div className='space-y-3'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Currently Reading</p>
                            <p className='text-sm font-medium'>Atomic Habits - James Clear</p>
                            <div className='mt-1 w-full rounded-full bg-secondary'>
                                <div className='h-1.5 rounded-full bg-blue-500' style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <p className='text-sm text-muted-foreground'>Recent Courses</p>
                            <div className='text-sm'>
                                <p>• Advanced React Patterns</p>
                                <p>• Leadership Fundamentals</p>
                                <p>• Financial Modeling</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Relationships */}
                <div className='rounded-lg border bg-card p-6'>
                    <div className='mb-4 flex items-center gap-2'>
                        <Heart className='h-5 w-5 text-red-500' />
                        <h3 className='font-semibold'>Relationships</h3>
                    </div>
                    <div className='space-y-3'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Last Family Call</p>
                            <p className='text-sm'>2 days ago</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Friend Meetups This Month</p>
                            <p className='text-sm'>4 planned</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Upcoming Events</p>
                            <div className='text-sm'>
                                <p>• Date night - Friday</p>
                                <p>• Family dinner - Sunday</p>
                                <p>• Friend\'s birthday - Next week</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className='rounded-lg border bg-card p-6'>
                <h3 className='mb-4 font-semibold'>Recent Activity</h3>
                <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-green-100 p-1.5 dark:bg-green-900/20'>
                            <Dumbbell className='h-3 w-3 text-green-600 dark:text-green-400' />
                        </div>
                        <div className='flex-1'>
                            <p className='text-sm'>Completed morning workout - Upper body strength</p>
                            <p className='text-xs text-muted-foreground'>2 hours ago</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/20'>
                            <Book className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                        </div>
                        <div className='flex-1'>
                            <p className='text-sm'>Read 25 pages of Atomic Habits</p>
                            <p className='text-xs text-muted-foreground'>Yesterday</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-red-100 p-1.5 dark:bg-red-900/20'>
                            <Heart className='h-3 w-3 text-red-500' />
                        </div>
                        <div className='flex-1'>
                            <p className='text-sm'>Called mom for weekly check-in</p>
                            <p className='text-xs text-muted-foreground'>2 days ago</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-purple-100 p-1.5 dark:bg-purple-900/20'>
                            <MapPin className='h-3 w-3 text-purple-600 dark:text-purple-400' />
                        </div>
                        <div className='flex-1'>
                            <p className='text-sm'>Weekend trip to the mountains</p>
                            <p className='text-xs text-muted-foreground'>Last weekend</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}