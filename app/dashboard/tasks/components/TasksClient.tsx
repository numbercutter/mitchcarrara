'use client';

import { useState, useEffect } from 'react';
import {
    Calendar,
    TrendingUp,
    Clock,
    Users,
    CheckSquare,
    AlertCircle,
    ArrowRight,
    Circle,
    CircleCheckBig,
    CircleDot,
    BarChart3,
    PieChart,
    Activity,
    Target,
    Settings,
    DollarSign,
    CreditCard,
    Plus,
} from 'lucide-react';
import { Tables } from '@/types/database';
import { formatTimeAgo, getPriorityColor, getStatusColor } from '@/lib/database/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TaskModal from './TaskModal';

// Type helpers
type Task = Tables<'tasks'> & {
    payment_status?: 'paid' | 'unpaid' | 'pending' | null;
    payment_amount?: number | null;
    payment_date?: string | null;
    payment_notes?: string | null;
};

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
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [billingStats, setBillingStats] = useState<BillingStats | null>(initialBillingStats || null);
    const [isLoadingBillingStats, setIsLoadingBillingStats] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);

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

    const recentTasks = tasks.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);

    // Toggle payment status for a task
    const togglePaymentStatus = async (taskId: string) => {
        try {
            const task = tasks.find((t) => t.id === taskId);
            if (!task) return;

            const currentStatus = task.payment_status || 'unpaid';
            let newStatus: 'paid' | 'unpaid' | 'pending';
            let payment_date: string | null = null;
            let payment_amount: number | null = null;

            // Cycle through statuses: unpaid -> pending -> paid -> unpaid
            if (currentStatus === 'unpaid') {
                newStatus = 'pending';
            } else if (currentStatus === 'pending') {
                newStatus = 'paid';
                payment_date = new Date().toISOString();
                // Calculate payment amount based on estimate and $35/hour rate
                const hours = parseHours(task.estimate);
                payment_amount = Math.round(hours * 35 * 100) / 100;
            } else {
                newStatus = 'unpaid';
                payment_date = null;
                payment_amount = null;
            }

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_status: newStatus,
                    payment_date,
                    payment_amount,
                }),
            });

            if (response.ok) {
                setTasks((prev) =>
                    prev.map((t) =>
                        t.id === taskId
                            ? {
                                  ...t,
                                  payment_status: newStatus,
                                  payment_date,
                                  payment_amount,
                              }
                            : t
                    )
                );
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };

    // Calculate billing statistics from tasks
    const calculateBillingStats = () => {
        // Parse estimate from string to hours (e.g., "2.5" -> 2.5, "2 hours" -> 2)
        const parseHours = (estimate: string | null): number => {
            if (!estimate) return 0;
            const match = estimate.toString().match(/(\d+(?:\.\d+)?)/);
            return match ? parseFloat(match[1]) : 0;
        };

        const completedTasks = tasks.filter((task) => task.status === 'done');
        const paidTasks = tasks.filter((task) => task.payment_status === 'paid');
        const pendingTasks = tasks.filter((task) => task.payment_status === 'pending');
        const unpaidTasks = tasks.filter((task) => task.payment_status === 'unpaid' || !task.payment_status);

        const totalEstimatedHours = tasks.reduce((sum, task) => sum + parseHours(task.estimate), 0);
        const completedHours = completedTasks.reduce((sum, task) => sum + parseHours(task.estimate), 0);
        const paidHours = paidTasks.reduce((sum, task) => sum + parseHours(task.estimate), 0);
        const pendingHours = pendingTasks.reduce((sum, task) => sum + parseHours(task.estimate), 0);
        const unpaidHours = unpaidTasks.reduce((sum, task) => sum + parseHours(task.estimate), 0);

        const hourlyRate = 35; // Fixed rate
        const totalEstimatedValue = totalEstimatedHours * hourlyRate;
        const completedValue = completedHours * hourlyRate;
        const paidValue = paidTasks.reduce((sum, task) => sum + (task.payment_amount || 0), 0);
        const pendingValue = pendingHours * hourlyRate;
        const unpaidValue = unpaidHours * hourlyRate;

        return {
            totalEstimatedHours,
            totalEstimatedValue,
            completedHours,
            completedValue,
            paidHours,
            paidValue,
            pendingHours,
            pendingValue,
            unpaidHours,
            unpaidValue,
            hourlyRate,
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            paidTasks: paidTasks.length,
            pendingTasks: pendingTasks.length,
            unpaidTasks: unpaidTasks.length,
        };
    };

    // Helper function to parse hours
    const parseHours = (estimate: string | null): number => {
        if (!estimate) return 0;
        const match = estimate.toString().match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    };

    const billingData = calculateBillingStats();
    const completionProgress = billingData.totalEstimatedHours > 0 ? Math.round((billingData.completedHours / billingData.totalEstimatedHours) * 100) : 0;

    // Task modal functions
    const openTaskModal = (task?: Task) => {
        setSelectedTask(task || null);
        setIsCreatingTask(!task);
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
        setIsCreatingTask(false);
        setIsTaskModalOpen(false);
    };

    const handleSaveTask = async (taskData: Partial<Task>) => {
        try {
            if (taskData.id) {
                // Update existing task
                const response = await fetch(`/api/tasks/${taskData.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData),
                });

                if (response.ok) {
                    const updatedTask = await response.json();
                    setTasks((prev) => prev.map((t) => (t.id === taskData.id ? updatedTask : t)));
                }
            } else {
                // Create new task
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData),
                });

                if (response.ok) {
                    const newTask = await response.json();
                    setTasks((prev) => [newTask, ...prev]);
                }
            }
            closeTaskModal();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setTasks((prev) => prev.filter((t) => t.id !== taskId));
                closeTaskModal();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className='flex h-full min-h-0 flex-col'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 pb-6 backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Tasks Overview</h1>
                        <p className='text-muted-foreground'>Statistical overview of all your tasks and productivity</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button onClick={() => openTaskModal()} className='flex items-center gap-2'>
                            <Plus className='h-4 w-4' />
                            New Task
                        </Button>
                        <Link href='/dashboard/tasks/manage' className='flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90'>
                            <Settings className='h-4 w-4' />
                            Manage Tasks
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className='min-h-0 flex-1 overflow-y-auto pt-6'>
                {/* Key Metrics */}
                <div className='mb-8 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4'>
                    <div className='rounded-lg border bg-card p-4 lg:p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-xs font-medium text-muted-foreground lg:text-sm'>Total Tasks</p>
                                <p className='text-2xl font-bold lg:text-3xl'>{taskStats.total}</p>
                            </div>
                            <Target className='h-6 w-6 text-primary lg:h-8 lg:w-8' />
                        </div>
                    </div>

                    <div className='rounded-lg border bg-card p-4 lg:p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-xs font-medium text-muted-foreground lg:text-sm'>Active Tasks</p>
                                <p className='text-2xl font-bold lg:text-3xl'>{activeTasksCount}</p>
                            </div>
                            <Activity className='h-8 w-8 text-yellow-500' />
                        </div>
                    </div>

                    <div className='rounded-lg border bg-card p-4 lg:p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-xs font-medium text-muted-foreground lg:text-sm'>Paid Tasks</p>
                                <p className='text-2xl font-bold text-green-600 lg:text-3xl'>{billingData.paidTasks}</p>
                                <p className='mt-1 text-xs text-muted-foreground'>${billingData.paidValue.toLocaleString()} earned</p>
                            </div>
                            <DollarSign className='h-6 w-6 text-green-500 lg:h-8 lg:w-8' />
                        </div>
                    </div>

                    <div className='rounded-lg border bg-card p-4 lg:p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-xs font-medium text-muted-foreground lg:text-sm'>Unpaid Tasks</p>
                                <p className='text-2xl font-bold text-orange-600 lg:text-3xl'>{billingData.unpaidTasks}</p>
                                <p className='mt-1 text-xs text-muted-foreground'>${billingData.unpaidValue.toLocaleString()} pending</p>
                            </div>
                            <CreditCard className='h-6 w-6 text-orange-500 lg:h-8 lg:w-8' />
                        </div>
                    </div>
                </div>

                {/* Payment Overview Section */}
                <div className='mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <div className='rounded-lg border bg-card p-4 lg:p-6'>
                        <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
                            <BarChart3 className='h-5 w-5' />
                            Payment Summary
                        </h3>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20'>
                                <div>
                                    <p className='text-sm font-medium text-green-700 dark:text-green-300'>Paid</p>
                                    <p className='text-lg font-bold text-green-900 dark:text-green-100'>{billingData.paidHours.toFixed(1)}h</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm text-green-600 dark:text-green-400'>Earned</p>
                                    <p className='text-lg font-bold text-green-900 dark:text-green-100'>${billingData.paidValue.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className='flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20'>
                                <div>
                                    <p className='text-sm font-medium text-orange-700 dark:text-orange-300'>Unpaid</p>
                                    <p className='text-lg font-bold text-orange-900 dark:text-orange-100'>{billingData.unpaidHours.toFixed(1)}h</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm text-orange-600 dark:text-orange-400'>Pending</p>
                                    <p className='text-lg font-bold text-orange-900 dark:text-orange-100'>${billingData.unpaidValue.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className='flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
                                <div>
                                    <p className='text-sm font-medium text-blue-700 dark:text-blue-300'>Pending Payment</p>
                                    <p className='text-lg font-bold text-blue-900 dark:text-blue-100'>{billingData.pendingHours.toFixed(1)}h</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm text-blue-600 dark:text-blue-400'>Value</p>
                                    <p className='text-lg font-bold text-blue-900 dark:text-blue-100'>${billingData.pendingValue.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='rounded-lg border bg-card p-4 lg:p-6'>
                        <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
                            <Target className='h-5 w-5' />
                            Payment Analytics
                        </h3>
                        <div className='space-y-4'>
                            <div className='rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4 dark:from-green-900/20 dark:to-blue-900/20'>
                                <div className='mb-2 flex items-center justify-between'>
                                    <span className='text-sm font-medium'>Payment Rate</span>
                                    <span className='text-sm text-muted-foreground'>
                                        {billingData.totalTasks > 0 ? Math.round((billingData.paidTasks / billingData.totalTasks) * 100) : 0}%
                                    </span>
                                </div>
                                <div className='h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                                    <div
                                        className='h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300'
                                        style={{ width: `${billingData.totalTasks > 0 ? Math.min((billingData.paidTasks / billingData.totalTasks) * 100, 100) : 0}%` }}
                                    />
                                </div>
                                <p className='mt-2 text-xs text-muted-foreground'>
                                    {billingData.paidTasks} of {billingData.totalTasks} tasks paid
                                </p>
                            </div>

                            <div className='border-t border-border/50 pt-4'>
                                <p className='mb-2 text-sm text-muted-foreground'>Quick Stats</p>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span>Hourly Rate</span>
                                        <span className='font-medium'>${billingData.hourlyRate}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Avg per task</span>
                                        <span className='font-medium'>{tasks.length > 0 ? `${(billingData.totalEstimatedHours / tasks.length).toFixed(1)}h` : '0h'}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Total Earned</span>
                                        <span className='font-medium text-green-600'>${billingData.paidValue.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <div className='rounded-lg border bg-card p-6'>
                        <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
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
                                            <div className='h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700'>
                                                <div className={`h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} style={{ width: `${percentage}%` }} />
                                            </div>
                                            <span className='w-8 text-sm font-bold'>{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='rounded-lg border bg-card p-6'>
                        <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
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
                                    low: 'text-green-500 bg-green-500',
                                };

                                return (
                                    <div key={priority} className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <div className={`h-3 w-3 rounded-full ${colors[priority as keyof typeof colors].split(' ')[1]}`} />
                                            <span className='text-sm font-medium capitalize'>{priority} Priority</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm text-muted-foreground'>{percentage}%</span>
                                            <span className='w-8 text-sm font-bold'>{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
                        <Clock className='h-5 w-5' />
                        Recent Activity
                    </h3>
                    {recentTasks.length > 0 ? (
                        <div className='space-y-3'>
                            {recentTasks.map((task) => {
                                const status = task.status || 'todo';
                                const config = statusConfig[status as keyof typeof statusConfig];
                                const Icon = config?.icon || Circle;
                                const paymentStatus = task.payment_status || 'unpaid';
                                const taskHours = parseHours(task.estimate);

                                const getPaymentBadgeVariant = () => {
                                    switch (paymentStatus) {
                                        case 'paid':
                                            return 'default';
                                        case 'pending':
                                            return 'secondary';
                                        case 'unpaid':
                                            return 'outline';
                                        default:
                                            return 'outline';
                                    }
                                };

                                const getPaymentButtonText = () => {
                                    switch (paymentStatus) {
                                        case 'unpaid':
                                            return 'Mark Pending';
                                        case 'pending':
                                            return 'Mark Paid';
                                        case 'paid':
                                            return 'Mark Unpaid';
                                        default:
                                            return 'Mark Pending';
                                    }
                                };

                                return (
                                    <div
                                        key={task.id}
                                        className='flex cursor-pointer flex-col gap-2 rounded-lg bg-secondary/20 p-3 transition-colors hover:bg-secondary/30'
                                        onClick={() => openTaskModal(task)}>
                                        <div className='flex items-center gap-3'>
                                            <Icon className={`h-4 w-4 ${config?.color || 'text-gray-500'}`} />
                                            <div className='min-w-0 flex-1'>
                                                <p className='truncate text-sm font-medium'>{task.title}</p>
                                                <p className='text-xs text-muted-foreground'>
                                                    {task.updated_at ? formatTimeAgo(task.updated_at) : 'No date'} • {config?.label || 'Unknown Status'}
                                                    {taskHours > 0 && ` • ${taskHours}h`}
                                                </p>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Badge variant={getPaymentBadgeVariant()} className='text-xs'>
                                                    {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                                                </Badge>
                                                {task.priority && <span className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</span>}
                                            </div>
                                        </div>

                                        {/* Payment Toggle Section */}
                                        {taskHours > 0 && (
                                            <div className='flex items-center justify-between border-t border-border/50 pt-2'>
                                                <div className='text-xs text-muted-foreground'>
                                                    {task.payment_amount ? `$${task.payment_amount}` : `$${(taskHours * 35).toFixed(2)} est.`}
                                                </div>
                                                <Button
                                                    variant={paymentStatus === 'paid' ? 'destructive' : 'default'}
                                                    size='sm'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        togglePaymentStatus(task.id);
                                                    }}
                                                    className='h-7 px-3 text-xs'>
                                                    {getPaymentButtonText()}
                                                </Button>
                                            </div>
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
                        <Link href='/dashboard/tasks/manage' className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            <Settings className='h-4 w-4' />
                            Go to Task Management
                        </Link>
                    </div>
                )}
            </div>

            {/* Task Modal */}
            <TaskModal task={selectedTask} isOpen={isTaskModalOpen} onClose={closeTaskModal} onSave={handleSaveTask} onDelete={handleDeleteTask} />
        </div>
    );
}
