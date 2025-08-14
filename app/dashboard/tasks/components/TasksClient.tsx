'use client';

import { useState } from 'react';
import { Plus, Check, Clock, User, CheckSquare, AlertCircle, ArrowRight, Circle, CircleCheckBig, CircleDot, MoreVertical, Edit3, Trash2, Layout, List } from 'lucide-react';
import { Tables } from '@/types/database';
import { formatTimeAgo, getPriorityColor, getStatusColor } from '@/lib/database/utils';

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
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const addTask = async () => {
        if (!newTaskTitle.trim()) return;

        const titleToSave = newTaskTitle;
        const descriptionToSave = newTaskDescription;
        const tempTask: Task = {
            id: Date.now().toString(),
            title: titleToSave,
            description: descriptionToSave,
            status: 'todo',
            priority: newTaskPriority,
            assignee: 'me',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            due_date: null,
            estimate: null,
            labels: null,
            user_id: 'user-1', // This would come from auth
        };

        setTasks([tempTask, ...tasks]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setShowNewTaskForm(false);

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: titleToSave,
                    description: descriptionToSave,
                    status: 'todo',
                    priority: newTaskPriority,
                    assignee: 'me',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const savedTask = await response.json();
            // Update the temp task with the real data
            setTasks((prev) => prev.map((task) => (task.id === tempTask.id ? savedTask : task)));
        } catch (error) {
            console.error('Error creating task:', error);
            // Remove the temp task on error
            setTasks((prev) => prev.filter((task) => task.id !== tempTask.id));
        }
    };

    const updateTaskStatus = async (taskId: string, status: Task['status']) => {
        // Optimistically update the UI
        const oldTasks = tasks;
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status, updated_at: new Date().toISOString() } : task)));

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            // Task updated successfully - the optimistic update is already correct
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert the optimistic update
            setTasks(oldTasks);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const oldTasks = tasks;
        setTasks(tasks.filter((task) => task.id !== taskId));

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            setTasks(oldTasks);
        }
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter((task) => task.status === status || (status === 'todo' && !task.status));
    };

    const taskStats = {
        backlog: getTasksByStatus('backlog').length,
        todo: getTasksByStatus('todo').length,
        inProgress: getTasksByStatus('in-progress').length,
        inReview: getTasksByStatus('in-review').length,
        done: getTasksByStatus('done').length,
    };

    const TaskCard = ({ task }: { task: Task }) => {
        const status = task.status || 'todo';
        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || Circle;

        return (
            <div className='group cursor-pointer rounded-lg border bg-card p-4 transition-shadow hover:shadow-md'>
                <div className='mb-3 flex items-start justify-between'>
                    <div className='flex items-center gap-2'>
                        <Icon className={`h-4 w-4 ${config?.color || 'text-gray-500'}`} />
                        {task.priority && <span className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</span>}
                    </div>
                    <div className='opacity-0 transition-opacity group-hover:opacity-100'>
                        <button onClick={() => setSelectedTask(task)} className='rounded p-1 hover:bg-secondary'>
                            <MoreVertical className='h-4 w-4' />
                        </button>
                    </div>
                </div>

                <h3 className='mb-2 line-clamp-2 text-sm font-medium'>{task.title}</h3>

                {task.description && <p className='mb-3 line-clamp-3 text-xs text-muted-foreground'>{task.description}</p>}

                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                        <User className='h-3 w-3' />
                        {task.assignee === 'me' ? 'Me' : 'Assistant'}
                    </div>
                    <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {task.created_at ? formatTimeAgo(task.created_at) : 'No date'}
                    </div>
                </div>

                {/* Quick action buttons */}
                <div className='mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                    {task.status !== 'done' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                updateTaskStatus(task.id, task.status === 'todo' ? 'in-progress' : 'done');
                            }}
                            className='flex-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/20'>
                            {task.status === 'todo' ? 'Start' : 'Complete'}
                        </button>
                    )}
                    {task.status !== 'todo' && task.status !== 'done' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus = task.status === 'in-progress' ? 'in-review' : 'done';
                                updateTaskStatus(task.id, nextStatus);
                            }}
                            className='flex-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80'>
                            Next
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className='flex h-full flex-col'>
            {/* Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 pb-6 backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Tasks</h1>
                        <p className='mt-2 text-muted-foreground'>Manage and track your tasks efficiently</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1 rounded-lg border p-1'>
                            <button
                                onClick={() => setViewMode('board')}
                                className={`rounded p-2 ${viewMode === 'board' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                                <Layout className='h-4 w-4' />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`rounded p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                                <List className='h-4 w-4' />
                            </button>
                        </div>
                        <button
                            onClick={() => setShowNewTaskForm(true)}
                            className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            <Plus className='h-4 w-4' />
                            Add Task
                        </button>
                    </div>
                </div>

                {/* Task Stats */}
                <div className='mt-6 grid grid-cols-5 gap-4'>
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const count = taskStats[status as keyof typeof taskStats];
                        const Icon = config.icon;
                        return (
                            <div key={status} className={`rounded-lg border p-3 text-center ${config.bgColor}`}>
                                <div className='mb-1 flex items-center justify-center gap-2'>
                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                    <div className={`text-lg font-semibold ${config.color}`}>{count}</div>
                                </div>
                                <div className='text-xs text-muted-foreground'>{config.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Task Form Modal */}
            {showNewTaskForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>Create New Task</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Title *</label>
                                <input
                                    type='text'
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    placeholder='What needs to be done?'
                                />
                            </div>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Priority</label>
                                <select
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value='low'>Low</option>
                                    <option value='medium'>Medium</option>
                                    <option value='high'>High</option>
                                </select>
                            </div>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Description</label>
                                <textarea
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                    placeholder='Add more details...'
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={() => setShowNewTaskForm(false)} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={addTask} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className='flex-1 overflow-hidden pt-6'>
                {viewMode === 'board' ? (
                    <div className='h-full overflow-x-auto'>
                        <div className='flex h-full min-w-max gap-6 pb-6'>
                            {Object.entries(statusConfig).map(([status, config]) => {
                                const statusTasks = getTasksByStatus(status);
                                const Icon = config.icon;

                                return (
                                    <div key={status} className='flex w-80 flex-col'>
                                        <div className='sticky top-0 mb-4 flex items-center gap-2 bg-background py-2'>
                                            <Icon className={`h-4 w-4 ${config.color}`} />
                                            <h3 className='font-medium'>{config.label}</h3>
                                            <span className='text-sm text-muted-foreground'>({statusTasks.length})</span>
                                        </div>

                                        <div className='flex-1 space-y-3 overflow-y-auto'>
                                            {statusTasks.map((task) => (
                                                <TaskCard key={task.id} task={task} />
                                            ))}
                                            {statusTasks.length === 0 && (
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
                    </div>
                ) : (
                    <div className='h-full space-y-3 overflow-y-auto'>
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                        {tasks.length === 0 && (
                            <div className='py-12 text-center'>
                                <CheckSquare className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                                <h3 className='mb-2 text-lg font-semibold'>No tasks yet</h3>
                                <p className='mb-4 text-muted-foreground'>Create your first task to get started.</p>
                                <button onClick={() => setShowNewTaskForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                    Add Task
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <div className='mb-4 flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>Task Details</h3>
                            <button onClick={() => setSelectedTask(null)} className='rounded p-1 hover:bg-secondary'>
                                ✕
                            </button>
                        </div>

                        <div className='space-y-4'>
                            <div>
                                <h4 className='font-medium'>{selectedTask.title}</h4>
                                {selectedTask.description && <p className='mt-1 text-sm text-muted-foreground'>{selectedTask.description}</p>}
                            </div>

                            <div className='flex gap-4 text-sm'>
                                <div>
                                    <span className='text-muted-foreground'>Status:</span>
                                    <span className={`ml-2 rounded px-2 py-1 text-xs ${getStatusColor(selectedTask.status || 'todo')}`}>{selectedTask.status || 'todo'}</span>
                                </div>
                                <div>
                                    <span className='text-muted-foreground'>Priority:</span>
                                    <span className={`ml-2 rounded px-2 py-1 text-xs ${getPriorityColor(selectedTask.priority || 'medium')}`}>
                                        {selectedTask.priority || 'medium'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='mt-6 flex gap-2'>
                            <button
                                onClick={() => {
                                    deleteTask(selectedTask.id);
                                    setSelectedTask(null);
                                }}
                                className='flex items-center gap-2 rounded px-3 py-2 text-red-600 hover:bg-red-50'>
                                <Trash2 className='h-4 w-4' />
                                Delete
                            </button>
                            <button onClick={() => setSelectedTask(null)} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
