'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, Clock, Users, CheckSquare, AlertCircle, ArrowRight, Circle, CircleCheckBig, CircleDot, BarChart3, PieChart, Activity, Target, Settings } from 'lucide-react';
import { Tables } from '@/types/database';
import { formatTimeAgo, getPriorityColor, getStatusColor } from '@/lib/database/utils';
import Link from 'next/link';

// Type helpers
type Task = Tables<'tasks'>;

interface TasksClientProps {
    initialTasks: Task[];
}

const statusConfig = {
    backlog: { label: 'Backlog', icon: Circle, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
    todo: { label: 'To Do', icon: Circle, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    'in-progress': { label: 'In Progress', icon: CircleDot, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    'in-review': { label: 'In Review', icon: AlertCircle, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    done: { label: 'Done', icon: CircleCheckBig, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
};

export default function TasksClient({ initialTasks }: TasksClientProps) {
    const [tasks] = useState<Task[]>(initialTasks);

    const getTasksByStatus = (status: string) => {
        return tasks.filter((task) => task.status === status || (status === 'todo' && !task.status));
    };

    const getTasksByPriority = (priority: string) => {
        return tasks.filter((task) => task.priority === priority);
    };

    const taskStats = {
        total: tasks.length,
        backlog: getTasksByStatus('backlog').length,
        todo: getTasksByStatus('todo').length,
        inProgress: getTasksByStatus('in-progress').length,
        inReview: getTasksByStatus('in-review').length,
        done: getTasksByStatus('done').length,
        high: getTasksByPriority('high').length,
        medium: getTasksByPriority('medium').length,
        low: getTasksByPriority('low').length,
    };

    const completionRate = tasks.length > 0 ? Math.round((taskStats.done / tasks.length) * 100) : 0;
    const activeTasksCount = taskStats.todo + taskStats.inProgress + taskStats.inReview;
    
    const recentTasks = tasks
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

    return (
        <div className='flex h-full flex-col min-h-0'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm pb-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Tasks Overview</h1>
                        <p className='text-muted-foreground'>Statistical overview of all your tasks and productivity</p>
                    </div>
                    <Link 
                        href='/dashboard/tasks/manage'
                        className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                        <Settings className='h-4 w-4' />
                        Manage Tasks
                    </Link>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto pt-6 min-h-0'>
                {/* Key Metrics */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8'>
                    <div className='rounded-lg border bg-card p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Total Tasks</p>
                                <p className='text-3xl font-bold'>{taskStats.total}</p>
                            </div>
                            <Target className='h-8 w-8 text-primary' />
                        </div>
                    </div>
                    
                    <div className='rounded-lg border bg-card p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Active Tasks</p>
                                <p className='text-3xl font-bold'>{activeTasksCount}</p>
                            </div>
                            <Activity className='h-8 w-8 text-yellow-500' />
                        </div>
                    </div>
                    
                    <div className='rounded-lg border bg-card p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Completed</p>
                                <p className='text-3xl font-bold'>{taskStats.done}</p>
                            </div>
                            <CheckSquare className='h-8 w-8 text-green-500' />
                        </div>
                    </div>
                    
                    <div className='rounded-lg border bg-card p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Completion Rate</p>
                                <p className='text-3xl font-bold'>{completionRate}%</p>
                            </div>
                            <TrendingUp className='h-8 w-8 text-blue-500' />
                        </div>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8'>
                    <div className='rounded-lg border bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold flex items-center gap-2'>
                            <BarChart3 className='h-5 w-5' />
                            Status Distribution
                        </h3>
                        <div className='space-y-3'>
                            {Object.entries(statusConfig).map(([status, config]) => {
                                const count = taskStats[status as keyof typeof taskStats] as number;
                                const percentage = taskStats.total > 0 ? Math.round((count / taskStats.total) * 100) : 0;
                                const Icon = config.icon;
                                
                                return (
                                    <div key={status} className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Icon className={`h-4 w-4 ${config.color}`} />
                                            <span className='text-sm font-medium'>{config.label}</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700'>
                                                <div 
                                                    className={`h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className='text-sm font-bold w-8'>{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='rounded-lg border bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold flex items-center gap-2'>
                            <PieChart className='h-5 w-5' />
                            Priority Breakdown
                        </h3>
                        <div className='space-y-3'>
                            {['high', 'medium', 'low'].map((priority) => {
                                const count = taskStats[priority as keyof typeof taskStats] as number;
                                const percentage = taskStats.total > 0 ? Math.round((count / taskStats.total) * 100) : 0;
                                const colors = {
                                    high: 'text-red-500 bg-red-500',
                                    medium: 'text-yellow-500 bg-yellow-500', 
                                    low: 'text-green-500 bg-green-500'
                                };
                                
                                return (
                                    <div key={priority} className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <div className={`h-3 w-3 rounded-full ${colors[priority as keyof typeof colors].split(' ')[1]}`} />
                                            <span className='text-sm font-medium capitalize'>{priority} Priority</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm text-muted-foreground'>{percentage}%</span>
                                            <span className='text-sm font-bold w-8'>{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 text-lg font-semibold flex items-center gap-2'>
                        <Clock className='h-5 w-5' />
                        Recent Activity
                    </h3>
                    {recentTasks.length > 0 ? (
                        <div className='space-y-3'>
                            {recentTasks.map((task) => {
                                const status = task.status || 'todo';
                                const config = statusConfig[status as keyof typeof statusConfig];
                                const Icon = config?.icon || Circle;
                                
                                return (
                                    <div key={task.id} className='flex items-center gap-3 p-3 rounded-lg bg-secondary/20'>
                                        <Icon className={`h-4 w-4 ${config?.color || 'text-gray-500'}`} />
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-medium truncate'>{task.title}</p>
                                            <p className='text-xs text-muted-foreground'>
                                                {task.updated_at ? formatTimeAgo(task.updated_at) : 'No date'} • {config?.label || 'Unknown Status'}
                                            </p>
                                        </div>
                                        {task.priority && (
                                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className='py-8 text-center text-muted-foreground'>
                            <Calendar className='mx-auto mb-2 h-8 w-8 opacity-50' />
                            <p className='text-sm'>No recent activity</p>
                        </div>
                    )}
                </div>

                {taskStats.total === 0 && (
                    <div className='py-12 text-center'>
                        <CheckSquare className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                        <h3 className='mb-2 text-lg font-semibold'>No tasks yet</h3>
                        <p className='mb-4 text-muted-foreground'>Start by creating your first task in the manage section.</p>
                        <Link 
                            href='/dashboard/tasks/manage'
                            className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            <Settings className='h-4 w-4' />
                            Go to Task Management
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
