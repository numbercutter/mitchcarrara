'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, DollarSign, CheckCircle, XCircle, Calendar, Filter } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

type TimeEntry = {
    id: string;
    minutes: number;
    date: string;
    created_at: string;
};

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    priority: string | null;
    created_at: string | null;
    updated_at: string | null;
    due_date: string | null;
    estimate: string | null;
    labels: string[] | null;
    assignee: string | null;
    time_entries: TimeEntry[];
};

type BillingStats = {
    totalTasks: number;
    completedTasks: number;
    totalHours: number;
    paidHours: number;
    unpaidHours: number;
    totalEarnings: number;
    pendingEarnings: number;
};

type BillingClientProps = {
    initialTasks: Task[];
};

export default function BillingClient({ initialTasks }: BillingClientProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [hourlyRate, setHourlyRate] = useState<number>(25); // Default $25/hour
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPayment, setFilterPayment] = useState<string>('all');
    const [selectedWeek, setSelectedWeek] = useState<string>('');

    // Calculate billing statistics
    const calculateStats = (): BillingStats => {
        let totalTasks = tasks.length;
        let completedTasks = tasks.filter((task) => task.status === 'completed').length;
        let totalMinutes = 0;
        let paidMinutes = 0;

        tasks.forEach((task) => {
            const taskMinutes = task.time_entries.reduce((sum, entry) => sum + entry.minutes, 0);
            totalMinutes += taskMinutes;

            // Check if task is marked as paid (using labels array)
            if (task.labels?.includes('paid')) {
                paidMinutes += taskMinutes;
            }
        });

        const totalHours = totalMinutes / 60;
        const paidHours = paidMinutes / 60;
        const unpaidHours = totalHours - paidHours;

        return {
            totalTasks,
            completedTasks,
            totalHours: Math.round(totalHours * 100) / 100,
            paidHours: Math.round(paidHours * 100) / 100,
            unpaidHours: Math.round(unpaidHours * 100) / 100,
            totalEarnings: Math.round(totalHours * hourlyRate * 100) / 100,
            pendingEarnings: Math.round(unpaidHours * hourlyRate * 100) / 100,
        };
    };

    const stats = calculateStats();

    // Filter tasks based on selected filters
    const filteredTasks = tasks.filter((task) => {
        // Status filter
        if (filterStatus !== 'all' && task.status !== filterStatus) {
            return false;
        }

        // Payment filter
        if (filterPayment === 'paid' && !task.labels?.includes('paid')) {
            return false;
        }
        if (filterPayment === 'unpaid' && task.labels?.includes('paid')) {
            return false;
        }

        // Week filter
        if (selectedWeek) {
            const weekStart = startOfWeek(parseISO(selectedWeek));
            const weekEnd = endOfWeek(parseISO(selectedWeek));

            const hasTimeInWeek = task.time_entries.some((entry) => {
                const entryDate = parseISO(entry.date);
                return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
            });

            if (!hasTimeInWeek) {
                return false;
            }
        }

        return true;
    });

    // Toggle payment status for a task
    const togglePaymentStatus = async (taskId: string) => {
        try {
            const task = tasks.find((t) => t.id === taskId);
            if (!task) return;

            const currentLabels = task.labels || [];
            const isPaid = currentLabels.includes('paid');

            let newLabels;
            if (isPaid) {
                // Remove 'paid' label
                newLabels = currentLabels.filter((label) => label !== 'paid');
            } else {
                // Add 'paid' label
                newLabels = [...currentLabels, 'paid'];
            }

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labels: newLabels }),
            });

            if (response.ok) {
                setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, labels: newLabels } : t)));
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };

    // Calculate task earnings
    const getTaskEarnings = (task: Task) => {
        const totalMinutes = task.time_entries.reduce((sum, entry) => sum + entry.minutes, 0);
        const hours = totalMinutes / 60;
        return Math.round(hours * hourlyRate * 100) / 100;
    };

    // Get task time in hours
    const getTaskHours = (task: Task) => {
        const totalMinutes = task.time_entries.reduce((sum, entry) => sum + entry.minutes, 0);
        return Math.round((totalMinutes / 60) * 100) / 100;
    };

    return (
        <div className='container mx-auto space-y-6 p-6'>
            {/* Header */}
            <div>
                <h1 className='text-3xl font-bold'>Assistant Billing Portal</h1>
                <p className='text-muted-foreground'>Track task completion and payment status</p>
            </div>

            {/* Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex items-center space-x-4'>
                        <div>
                            <Label htmlFor='hourlyRate'>Hourly Rate ($)</Label>
                            <Input id='hourlyRate' type='number' value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className='w-32' min='0' step='0.01' />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Tasks</CardTitle>
                        <CheckCircle className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.totalTasks}</div>
                        <p className='text-xs text-muted-foreground'>{stats.completedTasks} completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Hours</CardTitle>
                        <Clock className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.totalHours}h</div>
                        <p className='text-xs text-muted-foreground'>{stats.unpaidHours}h unpaid</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Earnings</CardTitle>
                        <DollarSign className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>${stats.totalEarnings}</div>
                        <p className='text-xs text-muted-foreground'>At ${hourlyRate}/hour</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Pending Payment</CardTitle>
                        <XCircle className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-orange-600'>${stats.pendingEarnings}</div>
                        <p className='text-xs text-muted-foreground'>{stats.unpaidHours}h unpaid</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Filter className='h-4 w-4' />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-wrap gap-4'>
                        <div>
                            <Label>Task Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className='w-40'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All Status</SelectItem>
                                    <SelectItem value='todo'>To Do</SelectItem>
                                    <SelectItem value='in_progress'>In Progress</SelectItem>
                                    <SelectItem value='completed'>Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Payment Status</Label>
                            <Select value={filterPayment} onValueChange={setFilterPayment}>
                                <SelectTrigger className='w-40'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All</SelectItem>
                                    <SelectItem value='paid'>Paid</SelectItem>
                                    <SelectItem value='unpaid'>Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Week Filter</Label>
                            <Input type='week' value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className='w-40' />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
                <CardHeader>
                    <CardTitle>Assistant Tasks</CardTitle>
                    <CardDescription>Click the payment button to mark tasks as paid/unpaid</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {filteredTasks.map((task) => {
                            const isPaid = task.labels?.includes('paid');
                            const taskHours = getTaskHours(task);
                            const taskEarnings = getTaskEarnings(task);

                            return (
                                <div key={task.id} className='flex items-center justify-between rounded-lg border p-4'>
                                    <div className='flex-1'>
                                        <div className='mb-2 flex items-center gap-2'>
                                            <h3 className='font-semibold'>{task.title}</h3>
                                            <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>{task.status}</Badge>
                                            <Badge variant={isPaid ? 'default' : 'destructive'}>{isPaid ? 'Paid' : 'Unpaid'}</Badge>
                                        </div>

                                        {task.description && <p className='mb-2 text-sm text-muted-foreground'>{task.description}</p>}

                                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                            <div className='flex items-center gap-1'>
                                                <Clock className='h-4 w-4' />
                                                {taskHours}h tracked
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <DollarSign className='h-4 w-4' />${taskEarnings}
                                            </div>
                                            {task.created_at && (
                                                <div className='flex items-center gap-1'>
                                                    <Calendar className='h-4 w-4' />
                                                    {format(parseISO(task.created_at), 'MMM d, yyyy')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <Button variant={isPaid ? 'destructive' : 'default'} size='sm' onClick={() => togglePaymentStatus(task.id)} disabled={taskHours === 0}>
                                            {isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredTasks.length === 0 && <div className='py-8 text-center text-muted-foreground'>No tasks found matching the current filters.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
