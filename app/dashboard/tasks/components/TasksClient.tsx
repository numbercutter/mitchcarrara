'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, Users, CheckSquare, AlertCircle, ArrowRight, Circle, CircleCheckBig, CircleDot, BarChart3, PieChart, Activity, Target, Settings } from 'lucide-react';
import { Tables } from '@/types/database';
import { formatTimeAgo, getPriorityColor, getStatusColor } from '@/lib/database/utils';
import Link from 'next/link';

// Type helpers
type Task = Tables<'tasks'>;

interface BillingStats {
    thisWeek: {
        totalBillableHours: number;
        totalEstimatedHours: number;
        totalEstimatedValue: number;
        totalBillableValue: number;
        mostBillableTask: string | null;
        mostBillableHours: number;
    };
    lastWeek: {
        totalBillableHours: number;
        totalBillableValue: number;
    };
    comparison?: {
        hoursDifference: number;
        percentageChange: number;
        valueDifference: number;
    };
}

interface TasksClientProps {
    initialTasks: Task[];
    initialBillingStats?: BillingStats | null;
}

const statusConfig = {
    backlog: { label: 'Backlog', icon: Circle, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
    todo: { label: 'To Do', icon: Circle, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    'in-progress': { label: 'In Progress', icon: CircleDot, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    'in-review': { label: 'In Review', icon: AlertCircle, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    done: { label: 'Done', icon: CircleCheckBig, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
};

export default function TasksClient({ initialTasks, initialBillingStats }: TasksClientProps) {
    const [tasks] = useState<Task[]>(initialTasks);
    const [billingStats, setBillingStats] = useState<BillingStats | null>(initialBillingStats || null);
    const [isLoadingBillingStats, setIsLoadingBillingStats] = useState(false);

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

    // Calculate billing statistics from tasks
    const calculateBillingStats = () => {
        // Parse estimate from string to hours (e.g., "2.5" -> 2.5, "2 hours" -> 2)
        const parseHours = (estimate: string | null): number => {
            if (!estimate) return 0;
            const match = estimate.toString().match(/(\d+(?:\.\d+)?)/);
            return match ? parseFloat(match[1]) : 0;
        };

        const totalEstimatedHours = tasks.reduce((sum, task) => sum + parseHours(task.estimate), 0);
        // For now, use estimate as billable hours until database is updated
        const totalBillableHours = tasks.filter(task => task.status === 'done').reduce((sum, task) => sum + parseHours(task.estimate), 0);
        const completedTasks = tasks.filter(task => task.status === 'done');
        const completedBillableHours = completedTasks.reduce((sum, task) => sum + parseHours(task.estimate), 0);
        
        // Assuming $35/hour rate - this could be made configurable
        const hourlyRate = 35;
        const totalEstimatedValue = totalEstimatedHours * hourlyRate;
        const totalBillableValue = totalBillableHours * hourlyRate;
        
        return {
            totalEstimatedHours,
            totalBillableHours,
            totalEstimatedValue,
            totalBillableValue,
            completedBillableHours,
            completedBillableValue: completedBillableHours * hourlyRate,
            hourlyRate
        };
    };

    const billingData = calculateBillingStats();
    const weeklyProgress = billingData.totalEstimatedHours > 0 ? 
        Math.round((billingData.totalBillableHours / billingData.totalEstimatedHours) * 100) : 0;

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
                                <p className='text-sm font-medium text-muted-foreground'>Billable Hours</p>
                                <p className='text-3xl font-bold'>{billingData.totalBillableHours.toFixed(1)}h</p>
                                <p className='text-xs text-muted-foreground mt-1'>
                                    ${billingData.totalBillableValue.toLocaleString()} billed
                                </p>
                            </div>
                            <Clock className='h-8 w-8 text-purple-500' />
                        </div>
                    </div>
                    
                    <div className='rounded-lg border bg-card p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Completion Rate</p>
                                <p className='text-3xl font-bold'>{weeklyProgress}%</p>
                                <p className='text-xs text-muted-foreground mt-1'>
                                    {billingData.totalBillableHours.toFixed(1)}h of {billingData.totalEstimatedHours.toFixed(1)}h estimated
                                </p>
                            </div>
                            <TrendingUp className='h-8 w-8 text-blue-500' />
                        </div>
                    </div>
                </div>

                {/* Billing Overview Section */}
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8'>
                    <div className='rounded-lg border bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold flex items-center gap-2'>
                            <BarChart3 className='h-5 w-5' />
                            Billing Summary
                        </h3>
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20'>
                                <div>
                                    <p className='text-sm font-medium text-blue-700 dark:text-blue-300'>Total Estimated</p>
                                    <p className='text-lg font-bold text-blue-900 dark:text-blue-100'>
                                        {billingData.totalEstimatedHours.toFixed(1)}h
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm text-blue-600 dark:text-blue-400'>Value</p>
                                    <p className='text-lg font-bold text-blue-900 dark:text-blue-100'>
                                        ${billingData.totalEstimatedValue.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className='flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20'>
                                <div>
                                    <p className='text-sm font-medium text-green-700 dark:text-green-300'>Total Billable</p>
                                    <p className='text-lg font-bold text-green-900 dark:text-green-100'>
                                        {billingData.totalBillableHours.toFixed(1)}h
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm text-green-600 dark:text-green-400'>Value</p>
                                    <p className='text-lg font-bold text-green-900 dark:text-green-100'>
                                        ${billingData.totalBillableValue.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className='flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20'>
                                <div>
                                    <p className='text-sm font-medium text-purple-700 dark:text-purple-300'>Completed</p>
                                    <p className='text-lg font-bold text-purple-900 dark:text-purple-100'>
                                        {billingData.completedBillableHours.toFixed(1)}h
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm text-purple-600 dark:text-purple-400'>Value</p>
                                    <p className='text-lg font-bold text-purple-900 dark:text-purple-100'>
                                        ${billingData.completedBillableValue.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='rounded-lg border bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold flex items-center gap-2'>
                            <Target className='h-5 w-5' />
                            Billing Analytics
                        </h3>
                        <div className='space-y-4'>
                            <div className='p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'>
                                <div className='flex items-center justify-between mb-2'>
                                    <span className='text-sm font-medium'>Progress</span>
                                    <span className='text-sm text-muted-foreground'>{weeklyProgress}%</span>
                                </div>
                                <div className='w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700'>
                                    <div 
                                        className='bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300' 
                                        style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                                    />
                                </div>
                                <p className='text-xs text-muted-foreground mt-2'>
                                    Hours billed vs estimated
                                </p>
                            </div>
                            
                            <div className='pt-4 border-t border-border/50'>
                                <p className='text-sm text-muted-foreground mb-2'>Quick Stats</p>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span>Hourly Rate</span>
                                        <span className='font-medium'>${billingData.hourlyRate}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Avg per task</span>
                                        <span className='font-medium'>
                                            {tasks.length > 0 ? 
                                                `${(billingData.totalBillableHours / tasks.length).toFixed(1)}h` : 
                                                '0h'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Efficiency</span>
                                        <span className='font-medium'>
                                            {billingData.totalEstimatedHours > 0 ? 
                                                `${Math.round((billingData.totalBillableHours / billingData.totalEstimatedHours) * 100)}%` : 
                                                '0%'}
                                        </span>
                                    </div>
                                </div>
                            </div>
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
