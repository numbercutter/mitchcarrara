'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Circle, CheckCircle2, Clock, AlertTriangle, User, Edit3, Trash2, X, ArrowUpDown, ChevronDown, Calendar, Flag } from 'lucide-react';
import type { Tables } from '@/types/database';

type Task = Tables<'tasks'>;

// Extended task type with billable hours
interface TaskWithBilling extends Task {
    billable_hours?: number; // actual hours worked for billing
}

interface TaskManageClientProps {
    initialTasks: Task[];
}

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
    const [tasks, setTasks] = useState<TaskWithBilling[]>(initialTasks.map(task => ({
        ...task,
        billable_hours: 0
    })));
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskWithBilling | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'updated_at', direction: 'desc' });
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: 'me',
        due_date: '',
        estimate_hours: '',
        billable_hours: '',
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
            estimate_hours: '',
            billable_hours: '',
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
            estimate_hours: task.estimate_hours?.toString() || '',
            billable_hours: task.billable_hours?.toString() || '',
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
                        estimate_hours: taskForm.estimate_hours ? parseFloat(taskForm.estimate_hours) : null,
                        billable_hours: taskForm.billable_hours ? parseFloat(taskForm.billable_hours) : null,
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
                        estimate_hours: taskForm.estimate_hours ? parseFloat(taskForm.estimate_hours) : null,
                        billable_hours: taskForm.billable_hours ? parseFloat(taskForm.billable_hours) : null,
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
            setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)));
        }
    };

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks.filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                task.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
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
                    aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
                    bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
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
        <div className='flex h-full flex-col min-h-0'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm pb-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Task Management</h1>
                        <p className='text-muted-foreground'>Comprehensive task tracking and management</p>
                    </div>
                    <button 
                        onClick={() => setShowNewTaskForm(true)} 
                        className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                        <Plus className='h-4 w-4' />
                        New Task
                    </button>
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
                        <option value='all'>All Status</option>
                        {Object.entries(statusConfig).map(([status, config]) => (
                            <option key={status} value={status}>{config.label}</option>
                        ))}
                    </select>
                    
                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className='rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                        <option value='all'>All Priority</option>
                        {Object.entries(priorityConfig).map(([priority, config]) => (
                            <option key={priority} value={priority}>{config.label}</option>
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
            <div className='flex-1 overflow-y-auto pt-6 min-h-0'>
                {filteredAndSortedTasks.length > 0 ? (
                    <table className='w-full'>
                        <thead className='sticky top-0 bg-background/95 backdrop-blur-sm border-b'>
                                <tr className='text-left'>
                                    <th className='w-8 p-3'>
                                        <input
                                            type='checkbox'
                                            checked={selectedTasks.size === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                                            onChange={toggleAllTasks}
                                            className='rounded border border-input'
                                        />
                                    </th>
                                    <th className='p-3 min-w-[300px]'>
                                        <button 
                                            onClick={() => handleSort('title')}
                                            className='flex items-center gap-1 hover:text-primary font-medium'>
                                            Task
                                            <ArrowUpDown className='h-3 w-3' />
                                        </button>
                                    </th>
                                    <th className='p-3 w-32'>
                                        <button 
                                            onClick={() => handleSort('status')}
                                            className='flex items-center gap-1 hover:text-primary font-medium'>
                                            Status
                                            <ArrowUpDown className='h-3 w-3' />
                                        </button>
                                    </th>
                                    <th className='p-3 w-24'>
                                        <button 
                                            onClick={() => handleSort('priority')}
                                            className='flex items-center gap-1 hover:text-primary font-medium'>
                                            Priority
                                            <ArrowUpDown className='h-3 w-3' />
                                        </button>
                                    </th>
                                    <th className='p-3 w-24'>Assignee</th>
                                    <th className='p-3 w-32'>
                                        <button 
                                            onClick={() => handleSort('due_date')}
                                            className='flex items-center gap-1 hover:text-primary font-medium'>
                                            Due Date
                                            <ArrowUpDown className='h-3 w-3' />
                                        </button>
                                    </th>
                                    <th className='p-3 w-24'>Estimate</th>
                                    <th className='p-3 w-24'>Billable</th>
                                    <th className='p-3 w-32'>
                                        <button 
                                            onClick={() => handleSort('updated_at')}
                                            className='flex items-center gap-1 hover:text-primary font-medium'>
                                            Updated
                                            <ArrowUpDown className='h-3 w-3' />
                                        </button>
                                    </th>
                                    <th className='p-3 w-16'>Actions</th>
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
                                            className={`border-b hover:bg-secondary/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                                            <td className='p-3'>
                                                <input
                                                    type='checkbox'
                                                    checked={isSelected}
                                                    onChange={() => toggleTaskSelection(task.id)}
                                                    className='rounded border border-input'
                                                />
                                            </td>
                                            <td className='p-3'>
                                                <div className='space-y-1'>
                                                    <div className='font-medium text-sm'>{task.title}</div>
                                                    {task.description && (
                                                        <div className='text-xs text-muted-foreground line-clamp-2'>
                                                            {task.description}
                                                        </div>
                                                    )}
                                                    {task.labels && task.labels.length > 0 && (
                                                        <div className='flex flex-wrap gap-1 mt-1'>
                                                            {task.labels.slice(0, 3).map((label, index) => (
                                                                <span key={index} className='rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary'>
                                                                    {label}
                                                                </span>
                                                            ))}
                                                            {task.labels.length > 3 && (
                                                                <span className='text-xs text-muted-foreground'>+{task.labels.length - 3}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='p-3'>
                                                <div className='flex items-center gap-2'>
                                                    <StatusIcon className={`h-3 w-3 ${statusConfig_?.color}`} />
                                                    <span className='text-sm'>{statusConfig_?.label}</span>
                                                </div>
                                            </td>
                                            <td className='p-3'>
                                                <span className={`px-2 py-1 text-xs rounded-full ${priorityConfig_.color}`}>
                                                    {priorityConfig_.label}
                                                </span>
                                            </td>
                                            <td className='p-3'>
                                                <div className='flex items-center gap-2'>
                                                    <User className='h-3 w-3 text-muted-foreground' />
                                                    <span className='text-sm capitalize'>{task.assignee}</span>
                                                </div>
                                            </td>
                                            <td className='p-3'>
                                                {task.due_date ? (
                                                    <div className='flex items-center gap-2'>
                                                        <Calendar className='h-3 w-3 text-muted-foreground' />
                                                        <span className='text-sm'>
                                                            {new Date(task.due_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className='text-sm text-muted-foreground'>No date</span>
                                                )}
                                            </td>
                                            <td className='p-3'>
                                                <div className='text-sm'>
                                                    {task.estimate_hours ? (
                                                        <span className='font-medium text-muted-foreground'>
                                                            {formatHours(task.estimate_hours)}
                                                        </span>
                                                    ) : (
                                                        <span className='text-muted-foreground'>No estimate</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='p-3'>
                                                <div className='text-sm'>
                                                    {task.billable_hours ? (
                                                        <span className='font-medium text-green-600 dark:text-green-400'>
                                                            {formatHours(task.billable_hours)}
                                                        </span>
                                                    ) : (
                                                        <span className='text-muted-foreground'>No billable</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='p-3'>
                                                <span className='text-sm text-muted-foreground'>
                                                    {new Date(task.updated_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className='p-3'>
                                                <div className='flex items-center gap-1'>
                                                    <button 
                                                        onClick={() => openEditForm(task)}
                                                        className='rounded p-1.5 hover:bg-secondary transition-colors'>
                                                        <Edit3 className='h-3 w-3' />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteTask(task.id)}
                                                        className='rounded p-1.5 hover:bg-secondary text-destructive transition-colors'>
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
                    <div className='flex-1 flex items-center justify-center'>
                        {tasks.length === 0 ? (
                            <div className='text-center'>
                                <CheckCircle2 className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                                <h3 className='mb-2 text-lg font-semibold'>No Tasks Yet</h3>
                                <p className='mb-4 text-muted-foreground'>Create your first task to get started.</p>
                                <button 
                                    onClick={() => setShowNewTaskForm(true)} 
                                    className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
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

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='mb-2 block text-sm font-medium'>Estimate Hours</label>
                                    <input
                                        type='number'
                                        step='0.25'
                                        min='0'
                                        value={taskForm.estimate_hours}
                                        onChange={(e) => setTaskForm((prev) => ({ ...prev, estimate_hours: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                        placeholder='e.g., 2.5'
                                    />
                                </div>
                                <div>
                                    <label className='mb-2 block text-sm font-medium'>Billable Hours</label>
                                    <input
                                        type='number'
                                        step='0.25'
                                        min='0'
                                        value={taskForm.billable_hours}
                                        onChange={(e) => setTaskForm((prev) => ({ ...prev, billable_hours: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                        placeholder='e.g., 2.0'
                                    />
                                </div>
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
        </div>
    );
}
