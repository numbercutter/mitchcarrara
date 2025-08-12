'use client';

import { useState } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Circle, CheckCircle2, Clock, AlertTriangle, User, Edit3, Trash2, X } from 'lucide-react';
import type { Tables } from '@/types/database';

type Task = Tables<'tasks'>;

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
    low: { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
};

export default function TaskManageClient({ initialTasks }: TaskManageClientProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
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

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const groupedTasks = filteredTasks.reduce(
        (acc, task) => {
            const status = task.status || 'todo';
            if (!acc[status]) acc[status] = [];
            acc[status].push(task);
            return acc;
        },
        {} as Record<string, Task[]>
    );

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Task Management</h1>
                    <p className='text-muted-foreground'>Organize and track your tasks efficiently</p>
                </div>
                <button onClick={() => setShowNewTaskForm(true)} className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                    <Plus className='h-4 w-4' />
                    New Task
                </button>
            </div>

            {/* Search and Filters */}
            <div className='flex gap-4'>
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
                    className='rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                    <option value='all'>All Status</option>
                    <option value='backlog'>Backlog</option>
                    <option value='todo'>Todo</option>
                    <option value='in-progress'>In Progress</option>
                    <option value='in-review'>In Review</option>
                    <option value='done'>Done</option>
                </select>
            </div>

            {/* Task Stats */}
            <div className='grid gap-4 md:grid-cols-4'>
                {Object.entries(statusConfig).map(([status, config]) => {
                    const count = tasks.filter((task) => task.status === status).length;
                    const Icon = config.icon;
                    return (
                        <div key={status} className={`rounded-lg border p-4 ${config.bg}`}>
                            <div className='flex items-center gap-2'>
                                <Icon className={`h-5 w-5 ${config.color}`} />
                                <span className='font-medium'>{config.label}</span>
                            </div>
                            <p className='mt-2 text-2xl font-bold'>{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Task Kanban Board */}
            <div className='grid gap-6 lg:grid-cols-4'>
                {Object.entries(statusConfig).map(([status, config]) => {
                    const tasksInStatus = groupedTasks[status] || [];
                    const Icon = config.icon;

                    return (
                        <div key={status} className='space-y-4'>
                            <div className='flex items-center gap-2'>
                                <Icon className={`h-5 w-5 ${config.color}`} />
                                <h3 className='font-semibold'>{config.label}</h3>
                                <span className='text-sm text-muted-foreground'>({tasksInStatus.length})</span>
                            </div>

                            <div className='space-y-3'>
                                {tasksInStatus.map((task) => {
                                    const priorityStyle = priorityConfig[task.priority as keyof typeof priorityConfig];

                                    return (
                                        <div key={task.id} className='rounded-lg border bg-card p-4 transition-shadow hover:shadow-md'>
                                            <div className='mb-3 flex items-start justify-between'>
                                                <h4 className='line-clamp-2 font-medium'>{task.title}</h4>
                                                <div className='flex items-center gap-1'>
                                                    <button onClick={() => openEditForm(task)} className='rounded p-1 hover:bg-accent'>
                                                        <Edit3 className='h-3 w-3' />
                                                    </button>
                                                    <button onClick={() => deleteTask(task.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                                        <Trash2 className='h-3 w-3' />
                                                    </button>
                                                </div>
                                            </div>

                                            {task.description && <p className='mb-3 line-clamp-2 text-sm text-muted-foreground'>{task.description}</p>}

                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <span className={`rounded px-2 py-1 text-xs ${priorityStyle.color}`}>{priorityStyle.label}</span>
                                                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                                        <User className='h-3 w-3' />
                                                        <span className='capitalize'>{task.assignee}</span>
                                                    </div>
                                                </div>
                                                {task.due_date && <span className='text-xs text-muted-foreground'>{new Date(task.due_date).toLocaleDateString()}</span>}
                                            </div>

                                            {task.labels && task.labels.length > 0 && (
                                                <div className='mt-3 flex flex-wrap gap-1'>
                                                    {task.labels.map((label, index) => (
                                                        <span key={index} className='rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {task.estimate && <div className='mt-3 text-xs text-muted-foreground'>Estimate: {task.estimate}</div>}
                                        </div>
                                    );
                                })}

                                {tasksInStatus.length === 0 && (
                                    <div className='py-8 text-center text-muted-foreground'>
                                        <Circle className='mx-auto mb-2 h-8 w-8 opacity-50' />
                                        <p className='text-sm'>No tasks</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredTasks.length === 0 && tasks.length > 0 && (
                <div className='py-12 text-center'>
                    <Search className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                    <h3 className='mb-2 text-lg font-semibold'>No Tasks Found</h3>
                    <p className='text-muted-foreground'>No tasks match your search criteria.</p>
                </div>
            )}

            {tasks.length === 0 && (
                <div className='py-12 text-center'>
                    <Circle className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                    <h3 className='mb-2 text-lg font-semibold'>No Tasks Yet</h3>
                    <p className='mb-4 text-muted-foreground'>Create your first task to get started.</p>
                    <button onClick={() => setShowNewTaskForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                        Create Your First Task
                    </button>
                </div>
            )}

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
                                <label className='mb-2 block text-sm font-medium'>Estimate</label>
                                <input
                                    type='text'
                                    value={taskForm.estimate}
                                    onChange={(e) => setTaskForm((prev) => ({ ...prev, estimate: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    placeholder='e.g., 2 hours, 1 day'
                                />
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
