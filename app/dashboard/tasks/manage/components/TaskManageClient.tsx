'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Plus,
    Filter,
    Search,
    MoreHorizontal,
    Circle,
    CheckCircle2,
    Clock,
    AlertTriangle,
    User,
    Edit3,
    Trash2,
    X,
    ArrowUpDown,
    ChevronDown,
    Calendar,
    Flag,
    Eye,
    DollarSign,
    Minimize2,
    Maximize2,
} from 'lucide-react';
import type { Tables } from '@/types/database';
import TaskModal from '../../../tasks/components/TaskModal';

// Extended task type with payment fields
type Task = Tables<'tasks'> & {
    payment_status?: 'paid' | 'unpaid' | 'pending' | null;
    payment_amount?: number | null;
    payment_date?: string | null;
    payment_notes?: string | null;
};

// Extended task type with billable hours
interface TaskWithBilling extends Task {
    billable_hours?: number; // actual hours worked for billing
}

interface TaskManageClientProps {
    initialTasks: Task[];
}

// Helper function to parse due dates as local dates to avoid timezone issues
const parseLocalDate = (dateString: string): Date => {
    // Split the date string and create a date in local timezone
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
};

const statusConfig = {
    backlog: { label: 'Backlog', icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
    todo: { label: 'Todo', icon: Circle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    'in-progress': { label: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    'in-review': { label: 'In Review', icon: AlertTriangle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
};

const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', sort: 1 },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300', sort: 2 },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300', sort: 3 },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300', sort: 4 },
};

type SortField = 'title' | 'status' | 'priority' | 'updated_at' | 'created_at' | 'due_date';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

export default function TaskManageClient({ initialTasks }: TaskManageClientProps) {
    const [tasks, setTasks] = useState<TaskWithBilling[]>(
        initialTasks.map((task) => ({
            ...task,
            billable_hours: 0,
        }))
    );
    const [selectedStatus, setSelectedStatus] = useState<string>('active'); // Default to active tasks only
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskWithBilling | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'updated_at', direction: 'desc' });

    // New state for enhanced functionality
    const [isCompactView, setIsCompactView] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: 'me',
        due_date: '',
        estimate: '',
        labels: [] as string[],
    });
    const [newLabel, setNewLabel] = useState('');

    const resetForm = () => {
        setTaskForm({
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            assignee: 'me',
            due_date: '',
            estimate: '',
            labels: [],
        });
        setEditingTask(null);
        setShowNewTaskForm(false);
        setNewLabel('');
    };

    const openEditForm = (task: Task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description || '',
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            assignee: task.assignee || 'me',
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
            estimate: task.estimate || '',
            labels: task.labels || [],
        });
        setShowNewTaskForm(true);
    };

    const addLabel = () => {
        if (newLabel.trim() && !taskForm.labels.includes(newLabel.trim())) {
            setTaskForm((prev) => ({
                ...prev,
                labels: [...prev.labels, newLabel.trim()],
            }));
            setNewLabel('');
        }
    };

    const removeLabel = (labelToRemove: string) => {
        setTaskForm((prev) => ({
            ...prev,
            labels: prev.labels.filter((label) => label !== labelToRemove),
        }));
    };

    const saveTask = async () => {
        if (!taskForm.title.trim()) return;

        try {
            if (editingTask) {
                // Update existing task
                const response = await fetch(`/api/tasks/${editingTask.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: taskForm.title,
                        description: taskForm.description || null,
                        status: taskForm.status,
                        priority: taskForm.priority,
                        assignee: taskForm.assignee,
                        due_date: taskForm.due_date || null,
                        estimate: taskForm.estimate || null,
                        labels: taskForm.labels,
                    }),
                });

                if (!response.ok) throw new Error('Failed to update task');

                const updatedTask = await response.json();
                setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)));
            } else {
                // Create new task
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: taskForm.title,
                        description: taskForm.description || null,
                        status: taskForm.status,
                        priority: taskForm.priority,
                        assignee: taskForm.assignee,
                        due_date: taskForm.due_date || null,
                        estimate: taskForm.estimate || null,
                        labels: taskForm.labels,
                    }),
                });

                if (!response.ok) throw new Error('Failed to create task');

                const newTask = await response.json();
                setTasks((prev) => [...prev, newTask]);
            }

            resetForm();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        // Optimistically update the UI
        const oldTasks = tasks;
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update task status');
        } catch (error) {
            console.error('Error updating task status:', error);
            // Revert the optimistic update
            setTasks(oldTasks);
        }
    };

    const deleteTask = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete task');

            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
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

    // Payment status toggle functionality (from TasksClient)
    const togglePaymentStatus = async (taskId: string) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const currentStatus = task.payment_status || 'unpaid';
        let newStatus: 'paid' | 'unpaid' | 'pending';
        let paymentAmount: number | null = null;
        let paymentDate: string | null = null;

        // Cycle through: unpaid -> pending -> paid -> unpaid
        switch (currentStatus) {
            case 'unpaid':
                newStatus = 'pending';
                break;
            case 'pending':
                newStatus = 'paid';
                paymentAmount = parseHours(task.estimate) * 35; // $35/hour
                paymentDate = new Date().toISOString();
                break;
            case 'paid':
            default:
                newStatus = 'unpaid';
                paymentAmount = null;
                paymentDate = null;
                break;
        }

        // Optimistically update UI
        const oldTasks = tasks;
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, payment_status: newStatus, payment_amount: paymentAmount, payment_date: paymentDate } : t)));

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_status: newStatus,
                    payment_amount: paymentAmount,
                    payment_date: paymentDate,
                }),
            });

            if (!response.ok) throw new Error('Failed to update payment status');
        } catch (error) {
            console.error('Error updating payment status:', error);
            setTasks(oldTasks); // Revert on error
        }
    };

    // Task modal functionality
    const openTaskModal = (task: Task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
        setIsTaskModalOpen(false);
    };

    const handleSaveTask = (updatedTask: Task) => {
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? { ...task, ...updatedTask } : task)));
        closeTaskModal();
    };

    const handleDeleteTask = async (taskId: string) => {
        await deleteTask(taskId);
        closeTaskModal();
    };

    const handleSort = (field: SortField) => {
        const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ field, direction });
    };

    const toggleTaskSelection = (taskId: string) => {
        const newSelected = new Set(selectedTasks);
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId);
        } else {
            newSelected.add(taskId);
        }
        setSelectedTasks(newSelected);
    };

    const toggleAllTasks = () => {
        if (selectedTasks.size === filteredAndSortedTasks.length) {
            setSelectedTasks(new Set());
        } else {
            setSelectedTasks(new Set(filteredAndSortedTasks.map((t) => t.id)));
        }
    };

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks.filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Handle status filtering with special "active" filter
            let matchesStatus = true;
            if (selectedStatus === 'active') {
                // Active tasks: not done and not paid
                matchesStatus = task.status !== 'done' && task.payment_status !== 'paid';
            } else if (selectedStatus !== 'all') {
                matchesStatus = task.status === selectedStatus;
            }

            const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
            return matchesSearch && matchesStatus && matchesPriority;
        });

        // Sort tasks
        filtered.sort((a, b) => {
            const { field, direction } = sortConfig;
            let aValue: any, bValue: any;

            switch (field) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status || 'todo';
                    bValue = b.status || 'todo';
                    break;
                case 'priority':
                    aValue = priorityConfig[a.priority as keyof typeof priorityConfig]?.sort || 0;
                    bValue = priorityConfig[b.priority as keyof typeof priorityConfig]?.sort || 0;
                    break;
                case 'updated_at':
                    aValue = new Date(a.updated_at).getTime();
                    bValue = new Date(b.updated_at).getTime();
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'due_date':
                    aValue = a.due_date ? parseLocalDate(a.due_date).getTime() : 0;
                    bValue = b.due_date ? parseLocalDate(b.due_date).getTime() : 0;
                    break;
                default:
                    aValue = a.updated_at;
                    bValue = b.updated_at;
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [tasks, searchQuery, selectedStatus, selectedPriority, sortConfig]);

    return (
        <div className='flex h-full min-h-0 flex-col'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 pb-6 backdrop-blur-sm'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Task Management</h1>
                        <p className='text-muted-foreground'>Comprehensive task tracking and management</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button onClick={() => setIsCompactView(!isCompactView)} className='flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-secondary'>
                            {isCompactView ? <Maximize2 className='h-4 w-4' /> : <Minimize2 className='h-4 w-4' />}
                            {isCompactView ? 'Expand' : 'Compact'}
                        </button>
                        <button
                            onClick={() => setShowNewTaskForm(true)}
                            className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            <Plus className='h-4 w-4' />
                            New Task
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className='mt-6 flex items-center gap-4'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <input
                            type='text'
                            placeholder='Search tasks...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary'
                        />
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className='rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                        <option value='active'>Active Tasks</option>
                        <option value='all'>All Status</option>
                        {Object.entries(statusConfig).map(([status, config]) => (
                            <option key={status} value={status}>
                                {config.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className='rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                        <option value='all'>All Priority</option>
                        {Object.entries(priorityConfig).map(([priority, config]) => (
                            <option key={priority} value={priority}>
                                {config.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Task count */}
                <div className='mt-4 text-sm text-muted-foreground'>
                    {filteredAndSortedTasks.length} of {tasks.length} tasks
                    {selectedTasks.size > 0 && ` • ${selectedTasks.size} selected`}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className='min-h-0 flex-1 overflow-y-auto pt-6'>
                {filteredAndSortedTasks.length > 0 ? (
                    <table className='w-full'>
                        <thead className='sticky top-0 border-b bg-background/95 backdrop-blur-sm'>
                            <tr className='text-left'>
                                <th className={`w-8 ${isCompactView ? 'p-1' : 'p-3'}`}>
                                    <input
                                        type='checkbox'
                                        checked={selectedTasks.size === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                                        onChange={toggleAllTasks}
                                        className='rounded border border-input'
                                    />
                                </th>
                                <th className={`min-w-[300px] ${isCompactView ? 'p-1' : 'p-3'}`}>
                                    <button onClick={() => handleSort('title')} className='flex items-center gap-1 font-medium hover:text-primary'>
                                        Task
                                        <ArrowUpDown className='h-3 w-3' />
                                    </button>
                                </th>
                                <th className={`w-32 ${isCompactView ? 'p-1' : 'p-3'}`}>
                                    <button onClick={() => handleSort('status')} className='flex items-center gap-1 font-medium hover:text-primary'>
                                        Status
                                        <ArrowUpDown className='h-3 w-3' />
                                    </button>
                                </th>
                                {!isCompactView && (
                                    <th className='w-24 p-3'>
                                        <button onClick={() => handleSort('priority')} className='flex items-center gap-1 font-medium hover:text-primary'>
                                            Priority
                                            <ArrowUpDown className='h-3 w-3' />
                                        </button>
                                    </th>
                                )}
                                {!isCompactView && <th className='w-24 p-3'>Assignee</th>}
                                {!isCompactView && (
                                    <th className='w-32 p-3'>
                                        <button onClick={() => handleSort('due_date')} className='flex items-center gap-1 font-medium hover:text-primary'>
                                            Due Date
                                            <ArrowUpDown className='h-3 w-3' />
                                        </button>
                                    </th>
                                )}
                                {!isCompactView && <th className='w-24 p-3'>Estimate</th>}
                                <th className={`w-24 ${isCompactView ? 'p-1' : 'p-3'}`}>Payment</th>
                                {!isCompactView && (
                                    <th className='w-32 p-3'>
                                        <button onClick={() => handleSort('updated_at')} className='flex items-center gap-1 font-medium hover:text-primary'>
                                            Updated
                                            <ArrowUpDown className='h-3 w-3' />
                                        </button>
                                    </th>
                                )}
                                <th className={`w-20 ${isCompactView ? 'p-1' : 'p-3'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedTasks.map((task) => {
                                const status = task.status || 'todo';
                                const statusConfig_ = statusConfig[status as keyof typeof statusConfig];
                                const priorityConfig_ = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                                const StatusIcon = statusConfig_?.icon || Circle;
                                const isSelected = selectedTasks.has(task.id);

                                return (
                                    <tr
                                        key={task.id}
                                        className={`border-b transition-colors hover:bg-secondary/20 ${isSelected ? 'bg-primary/5' : ''} ${isCompactView ? 'h-12' : ''}`}>
                                        <td className={isCompactView ? 'p-1' : 'p-3'}>
                                            <input type='checkbox' checked={isSelected} onChange={() => toggleTaskSelection(task.id)} className='rounded border border-input' />
                                        </td>
                                        <td className={isCompactView ? 'p-1' : 'p-3'}>
                                            <div className={`space-y-1 ${isCompactView ? 'space-y-0' : ''}`}>
                                                <div className={`${isCompactView ? 'text-xs' : 'text-sm'} truncate font-medium`}>{task.title}</div>
                                                {!isCompactView && task.description && <div className='line-clamp-2 text-xs text-muted-foreground'>{task.description}</div>}
                                                {!isCompactView && task.labels && task.labels.length > 0 && (
                                                    <div className='mt-1 flex flex-wrap gap-1'>
                                                        {task.labels.slice(0, 3).map((label, index) => (
                                                            <span key={index} className='rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary'>
                                                                {label}
                                                            </span>
                                                        ))}
                                                        {task.labels.length > 3 && <span className='text-xs text-muted-foreground'>+{task.labels.length - 3}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={isCompactView ? 'p-1' : 'p-3'}>
                                            <div className='flex items-center gap-2'>
                                                <StatusIcon className={`h-3 w-3 ${statusConfig_?.color}`} />
                                                {!isCompactView && <span className='text-sm'>{statusConfig_?.label}</span>}
                                            </div>
                                        </td>
                                        {!isCompactView && (
                                            <td className='p-3'>
                                                <span className={`rounded-full px-2 py-1 text-xs ${priorityConfig_.color}`}>{priorityConfig_.label}</span>
                                            </td>
                                        )}
                                        {!isCompactView && (
                                            <td className='p-3'>
                                                <div className='flex items-center gap-2'>
                                                    <User className='h-3 w-3 text-muted-foreground' />
                                                    <span className='text-sm capitalize'>{task.assignee}</span>
                                                </div>
                                            </td>
                                        )}
                                        {!isCompactView && (
                                            <td className='p-3'>
                                                {task.due_date ? (
                                                    <div className='flex items-center gap-2'>
                                                        <Calendar className='h-3 w-3 text-muted-foreground' />
                                                        <span className='text-sm'>{parseLocalDate(task.due_date).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className='text-sm text-muted-foreground'>No date</span>
                                                )}
                                            </td>
                                        )}
                                        {!isCompactView && (
                                            <td className='p-3'>
                                                <div className='text-sm'>
                                                    {task.estimate ? (
                                                        <span className='font-medium text-muted-foreground'>{formatHours(parseHours(task.estimate))}</span>
                                                    ) : (
                                                        <span className='text-muted-foreground'>No estimate</span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td className={isCompactView ? 'p-1' : 'p-3'}>
                                            <button
                                                onClick={() => togglePaymentStatus(task.id)}
                                                className={`rounded ${isCompactView ? 'px-1 py-0.5' : 'px-2 py-1'} text-xs font-medium transition-colors ${
                                                    task.payment_status === 'paid'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300'
                                                        : task.payment_status === 'pending'
                                                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300'
                                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                                }`}>
                                                {isCompactView
                                                    ? task.payment_status === 'paid'
                                                        ? 'P'
                                                        : task.payment_status === 'pending'
                                                          ? '~'
                                                          : 'U'
                                                    : task.payment_status === 'paid'
                                                      ? 'Paid'
                                                      : task.payment_status === 'pending'
                                                        ? 'Pending'
                                                        : 'Unpaid'}
                                                {!isCompactView && task.payment_status === 'paid' && task.payment_amount && (
                                                    <div className='text-xs opacity-70'>${task.payment_amount}</div>
                                                )}
                                            </button>
                                        </td>
                                        {!isCompactView && (
                                            <td className='p-3'>
                                                <span className='text-sm text-muted-foreground'>{new Date(task.updated_at).toLocaleDateString()}</span>
                                            </td>
                                        )}
                                        <td className={isCompactView ? 'p-1' : 'p-3'}>
                                            <div className={`flex items-center ${isCompactView ? 'gap-0.5' : 'gap-1'}`}>
                                                <button
                                                    onClick={() => openTaskModal(task)}
                                                    className={`rounded ${isCompactView ? 'p-1' : 'p-1.5'} transition-colors hover:bg-secondary`}
                                                    title='View task details'>
                                                    <Eye className='h-3 w-3' />
                                                </button>
                                                <button
                                                    onClick={() => openEditForm(task)}
                                                    className={`rounded ${isCompactView ? 'p-1' : 'p-1.5'} transition-colors hover:bg-secondary`}>
                                                    <Edit3 className='h-3 w-3' />
                                                </button>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className={`rounded ${isCompactView ? 'p-1' : 'p-1.5'} text-destructive transition-colors hover:bg-secondary`}>
                                                    <Trash2 className='h-3 w-3' />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className='flex flex-1 items-center justify-center'>
                        {tasks.length === 0 ? (
                            <div className='text-center'>
                                <CheckCircle2 className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                                <h3 className='mb-2 text-lg font-semibold'>No Tasks Yet</h3>
                                <p className='mb-4 text-muted-foreground'>Create your first task to get started.</p>
                                <button onClick={() => setShowNewTaskForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                    Create Your First Task
                                </button>
                            </div>
                        ) : (
                            <div className='text-center'>
                                <Search className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                                <h3 className='mb-2 text-lg font-semibold'>No Tasks Found</h3>
                                <p className='text-muted-foreground'>No tasks match your current filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Task Form Modal */}
            {showNewTaskForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6'>
                        <div className='mb-6 flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                            <button onClick={resetForm} className='rounded p-1 hover:bg-accent'>
                                <X className='h-4 w-4' />
                            </button>
                        </div>

                        <div className='space-y-4'>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Title *</label>
                                <input
                                    type='text'
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    placeholder='Task title'
                                />
                            </div>

                            <div>
                                <label className='mb-2 block text-sm font-medium'>Description</label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                    placeholder='Task description...'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='mb-2 block text-sm font-medium'>Status</label>
                                    <select
                                        value={taskForm.status}
                                        onChange={(e) => setTaskForm((prev) => ({ ...prev, status: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                        <option value='backlog'>Backlog</option>
                                        <option value='todo'>Todo</option>
                                        <option value='in-progress'>In Progress</option>
                                        <option value='in-review'>In Review</option>
                                        <option value='done'>Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='mb-2 block text-sm font-medium'>Priority</label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                        <option value='low'>Low</option>
                                        <option value='medium'>Medium</option>
                                        <option value='high'>High</option>
                                        <option value='urgent'>Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='mb-2 block text-sm font-medium'>Assignee</label>
                                    <select
                                        value={taskForm.assignee}
                                        onChange={(e) => setTaskForm((prev) => ({ ...prev, assignee: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                        <option value='me'>Me</option>
                                        <option value='assistant'>Assistant</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='mb-2 block text-sm font-medium'>Due Date</label>
                                    <input
                                        type='date'
                                        value={taskForm.due_date}
                                        onChange={(e) => setTaskForm((prev) => ({ ...prev, due_date: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='mb-2 block text-sm font-medium'>Estimate (hours)</label>
                                <input
                                    type='text'
                                    value={taskForm.estimate}
                                    onChange={(e) => setTaskForm((prev) => ({ ...prev, estimate: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    placeholder='e.g., 2.5, 3 hours, 1.5h'
                                />
                                <p className='mt-1 text-xs text-muted-foreground'>Enter hours as number (e.g., 2.5) or with units (e.g., 3 hours)</p>
                            </div>

                            {/* Labels */}
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Labels</label>
                                <div className='mb-2 flex gap-2'>
                                    <input
                                        type='text'
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                                        className='flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                        placeholder='Add a label'
                                    />
                                    <button type='button' onClick={addLabel} className='rounded bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80'>
                                        Add
                                    </button>
                                </div>
                                <div className='flex flex-wrap gap-1'>
                                    {taskForm.labels.map((label, index) => (
                                        <span key={index} className='inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                            {label}
                                            <button type='button' onClick={() => removeLabel(label)} className='hover:text-primary/80'>
                                                <X className='h-3 w-3' />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={saveTask} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {editingTask ? 'Update' : 'Create'} Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            <TaskModal task={selectedTask} isOpen={isTaskModalOpen} onClose={closeTaskModal} onSave={handleSaveTask} onDelete={handleDeleteTask} />
        </div>
    );
}
