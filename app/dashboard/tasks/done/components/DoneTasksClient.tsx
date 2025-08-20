'use client';

import { useState, useMemo } from 'react';
import { CheckCircle2, DollarSign, Calendar, User, Clock, Flag, Search, Filter } from 'lucide-react';
import type { Tables } from '@/types/database';

// Extended task type with payment fields
type Task = Tables<'tasks'> & {
    payment_status?: 'paid' | 'unpaid' | 'pending' | null;
    payment_amount?: number | null;
    payment_date?: string | null;
    payment_notes?: string | null;
};

interface DoneTasksClientProps {
    initialTasks: Task[];
}

const statusConfig = {
    backlog: { label: 'Backlog', color: 'text-gray-500' },
    todo: { label: 'Todo', color: 'text-orange-500' },
    'in-progress': { label: 'In Progress', color: 'text-blue-500' },
    'in-review': { label: 'In Review', color: 'text-purple-500' },
    done: { label: 'Done', color: 'text-green-500' },
};

const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
};

// Helper function to parse due dates as local dates to avoid timezone issues
const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

const parseHours = (estimate: string | null): number => {
    if (!estimate) return 0;
    const match = estimate.toString().match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
};

const formatHours = (hours: number) => {
    if (hours === 0) return '0h';
    if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes}m`;
    }
    const wholeHours = Math.floor(hours);
    const remainingMinutes = Math.round((hours - wholeHours) * 60);
    return remainingMinutes > 0 ? `${wholeHours}h ${remainingMinutes}m` : `${wholeHours}h`;
};

export default function DoneTasksClient({ initialTasks }: DoneTasksClientProps) {
    const [tasks] = useState<Task[]>(initialTasks);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'completed' | 'paid'>('all');

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description?.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesFilter = true;
            if (filterType === 'completed') {
                matchesFilter = task.status === 'done';
            } else if (filterType === 'paid') {
                matchesFilter = task.payment_status === 'paid';
            }

            return matchesSearch && matchesFilter;
        });
    }, [tasks, searchQuery, filterType]);

    const stats = useMemo(() => {
        const completedTasks = tasks.filter((t) => t.status === 'done');
        const paidTasks = tasks.filter((t) => t.payment_status === 'paid');
        const totalEarnings = paidTasks.reduce((sum, task) => sum + (task.payment_amount || 0), 0);
        const totalHours = paidTasks.reduce((sum, task) => sum + parseHours(task.estimate), 0);

        return {
            completed: completedTasks.length,
            paid: paidTasks.length,
            earnings: totalEarnings,
            hours: totalHours,
        };
    }, [tasks]);

    return (
        <div className='flex h-full min-h-0 flex-col'>
            {/* Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 pb-6 backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Completed & Paid Tasks</h1>
                        <p className='text-muted-foreground'>Archive of finished work and payments</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className='mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
                    <div className='rounded-lg bg-card p-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Completed Tasks</p>
                                <p className='text-2xl font-bold text-green-600'>{stats.completed}</p>
                            </div>
                            <CheckCircle2 className='h-8 w-8 text-green-500' />
                        </div>
                    </div>

                    <div className='rounded-lg bg-card p-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Paid Tasks</p>
                                <p className='text-2xl font-bold text-blue-600'>{stats.paid}</p>
                            </div>
                            <DollarSign className='h-8 w-8 text-blue-500' />
                        </div>
                    </div>

                    <div className='rounded-lg bg-card p-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Total Earnings</p>
                                <p className='text-2xl font-bold text-green-600'>${stats.earnings}</p>
                            </div>
                            <DollarSign className='h-8 w-8 text-green-500' />
                        </div>
                    </div>

                    <div className='rounded-lg bg-card p-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Hours Worked</p>
                                <p className='text-2xl font-bold text-purple-600'>{formatHours(stats.hours)}</p>
                            </div>
                            <Clock className='h-8 w-8 text-purple-500' />
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className='mt-6 flex items-center gap-4'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <input
                            type='text'
                            placeholder='Search completed tasks...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary'
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as 'all' | 'completed' | 'paid')}
                        className='rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                        <option value='all'>All Done Tasks</option>
                        <option value='completed'>Status: Done</option>
                        <option value='paid'>Payment: Paid</option>
                    </select>
                </div>

                <div className='mt-4 text-sm text-muted-foreground'>
                    {filteredTasks.length} of {tasks.length} tasks
                </div>
            </div>

            {/* Scrollable Content */}
            <div className='min-h-0 flex-1 overflow-y-auto pt-6'>
                {filteredTasks.length > 0 ? (
                    <div className='grid gap-4'>
                        {filteredTasks.map((task) => {
                            const priorityConfig_ = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                            const paymentAmount = task.payment_amount || 0;
                            const estimatedHours = parseHours(task.estimate);

                            return (
                                <div key={task.id} className='rounded-lg border bg-card p-4 transition-colors hover:bg-secondary/20'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <div className='mb-2 flex items-center gap-2'>
                                                <h3 className='text-lg font-semibold'>{task.title}</h3>
                                                {task.status === 'done' && <CheckCircle2 className='h-5 w-5 text-green-500' />}
                                                {task.payment_status === 'paid' && (
                                                    <div className='rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300'>
                                                        Paid ${paymentAmount}
                                                    </div>
                                                )}
                                            </div>

                                            {task.description && <p className='mb-3 text-sm text-muted-foreground'>{task.description}</p>}

                                            <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                                                <div className='flex items-center gap-1'>
                                                    <User className='h-4 w-4' />
                                                    <span className='capitalize'>{task.assignee}</span>
                                                </div>

                                                {task.due_date && (
                                                    <div className='flex items-center gap-1'>
                                                        <Calendar className='h-4 w-4' />
                                                        <span>{parseLocalDate(task.due_date).toLocaleDateString()}</span>
                                                    </div>
                                                )}

                                                {task.estimate && (
                                                    <div className='flex items-center gap-1'>
                                                        <Clock className='h-4 w-4' />
                                                        <span>{formatHours(estimatedHours)}</span>
                                                    </div>
                                                )}

                                                <div className='flex items-center gap-1'>
                                                    <Flag className='h-4 w-4' />
                                                    <span className={`rounded px-2 py-0.5 text-xs ${priorityConfig_.color}`}>{priorityConfig_.label}</span>
                                                </div>
                                            </div>

                                            {task.labels && task.labels.length > 0 && (
                                                <div className='mt-2 flex flex-wrap gap-1'>
                                                    {task.labels.map((label, index) => (
                                                        <span key={index} className='rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className='ml-4 text-right text-sm text-muted-foreground'>
                                            <div>Completed</div>
                                            <div>{new Date(task.updated_at).toLocaleDateString()}</div>
                                            {task.payment_date && <div className='mt-1 text-green-600'>Paid {new Date(task.payment_date).toLocaleDateString()}</div>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className='flex flex-1 items-center justify-center'>
                        <div className='text-center'>
                            <CheckCircle2 className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                            <h3 className='mb-2 text-lg font-semibold'>No Completed Tasks</h3>
                            <p className='text-muted-foreground'>{tasks.length === 0 ? 'No tasks have been completed yet.' : 'No tasks match your current search filters.'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
