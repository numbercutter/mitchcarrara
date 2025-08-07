'use client';

import { useState } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Circle, CheckCircle2, Clock, AlertTriangle, User } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee: 'me' | 'assistant';
    labels: string[];
    createdAt: string;
    dueDate?: string;
    estimate?: string;
}

const statusConfig = {
    'backlog': { label: 'Backlog', icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
    'todo': { label: 'To Do', icon: Circle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    'in-progress': { label: 'In Progress', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    'in-review': { label: 'In Review', icon: AlertTriangle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    'done': { label: 'Done', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' }
};

const priorityConfig = {
    'low': { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    'medium': { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
    'high': { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
    'urgent': { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' }
};

export default function TaskManagePage() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: 'Review quarterly financial reports',
            description: 'Analyze Q1 performance across all companies and prepare executive summary',
            status: 'in-progress',
            priority: 'high',
            assignee: 'assistant',
            labels: ['finance', 'quarterly'],
            createdAt: '2024-01-15',
            dueDate: '2024-01-20',
            estimate: '4h'
        },
        {
            id: '2',
            title: 'Schedule investor meetings',
            description: 'Coordinate with 5 Series A investors for next week',
            status: 'todo',
            priority: 'urgent',
            assignee: 'assistant',
            labels: ['meetings', 'fundraising'],
            createdAt: '2024-01-14',
            dueDate: '2024-01-18'
        },
        {
            id: '3',
            title: 'Product roadmap planning',
            description: 'Define Q2 product priorities with engineering team',
            status: 'done',
            priority: 'medium',
            assignee: 'me',
            labels: ['product', 'planning'],
            createdAt: '2024-01-10'
        },
        {
            id: '4',
            title: 'Team performance reviews',
            description: 'Conduct annual reviews for 8 team members',
            status: 'backlog',
            priority: 'medium',
            assignee: 'me',
            labels: ['hr', 'reviews'],
            createdAt: '2024-01-12',
            estimate: '8h'
        },
        {
            id: '5',
            title: 'Marketing campaign analysis',
            description: 'Review performance of Q4 campaigns and optimize for Q1',
            status: 'in-review',
            priority: 'low',
            assignee: 'assistant',
            labels: ['marketing', 'analysis'],
            createdAt: '2024-01-13'
        }
    ]);

    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium' as Task['priority'],
        assignee: 'assistant' as Task['assignee'],
        dueDate: '',
        estimate: ''
    });

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const addTask = () => {
        if (!newTask.title.trim()) return;

        const task: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            description: newTask.description,
            status: 'todo',
            priority: newTask.priority,
            assignee: newTask.assignee,
            labels: [],
            createdAt: new Date().toISOString().split('T')[0],
            dueDate: newTask.dueDate || undefined,
            estimate: newTask.estimate || undefined
        };

        setTasks([...tasks, task]);
        setNewTask({ title: '', description: '', priority: 'medium', assignee: 'assistant', dueDate: '', estimate: '' });
        setShowNewTaskForm(false);
    };

    const updateTaskStatus = (taskId: string, status: Task['status']) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, status } : task
        ));
    };

    const statusCounts = {
        all: tasks.length,
        backlog: tasks.filter(t => t.status === 'backlog').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        'in-review': tasks.filter(t => t.status === 'in-review').length,
        done: tasks.filter(t => t.status === 'done').length
    };

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Task Management</h1>
                    <p className='mt-2 text-muted-foreground'>Organize and track your tasks Linear-style.</p>
                </div>
                <button
                    onClick={() => setShowNewTaskForm(true)}
                    className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                    <Plus className='h-4 w-4' />
                    New Task
                </button>
            </div>

            {/* Filters */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-2'>
                    <Filter className='h-4 w-4 text-muted-foreground' />
                    <div className='flex gap-1'>
                        {['all', 'backlog', 'todo', 'in-progress', 'in-review', 'done'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`rounded-md px-3 py-1 text-sm transition-colors ${
                                    selectedStatus === status
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}>
                                {status === 'all' ? 'All' : statusConfig[status as keyof typeof statusConfig]?.label} ({statusCounts[status as keyof typeof statusCounts]})
                            </button>
                        ))}
                    </div>
                </div>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <input
                        type='text'
                        placeholder='Search tasks...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full rounded-md border bg-background pl-9 pr-4 py-2 text-sm'
                    />
                </div>
            </div>

            {/* New Task Form */}
            {showNewTaskForm && (
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold'>Create New Task</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium mb-1'>Title</label>
                            <input
                                type='text'
                                value={newTask.title}
                                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='Task title...'
                            />
                        </div>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium mb-1'>Description</label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                className='w-full resize-none rounded border bg-background px-3 py-2 text-sm'
                                rows={3}
                                placeholder='Task description...'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Priority</label>
                            <select
                                value={newTask.priority}
                                onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value='low'>Low</option>
                                <option value='medium'>Medium</option>
                                <option value='high'>High</option>
                                <option value='urgent'>Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Assignee</label>
                            <select
                                value={newTask.assignee}
                                onChange={(e) => setNewTask({...newTask, assignee: e.target.value as Task['assignee']})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value='assistant'>Assistant</option>
                                <option value='me'>Me</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Due Date</label>
                            <input
                                type='date'
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Estimate</label>
                            <input
                                type='text'
                                value={newTask.estimate}
                                onChange={(e) => setNewTask({...newTask, estimate: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='2h, 1d, 1w...'
                            />
                        </div>
                    </div>
                    <div className='flex justify-end gap-2 mt-4'>
                        <button
                            onClick={() => setShowNewTaskForm(false)}
                            className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'>
                            Cancel
                        </button>
                        <button
                            onClick={addTask}
                            className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                            Create Task
                        </button>
                    </div>
                </div>
            )}

            {/* Tasks List */}
            <div className='space-y-2'>
                {filteredTasks.map((task) => {
                    const StatusIcon = statusConfig[task.status].icon;
                    return (
                        <div key={task.id} className='rounded-lg border bg-card p-4 hover:bg-secondary/10 transition-colors'>
                            <div className='flex items-start justify-between gap-4'>
                                <div className='flex items-start gap-3 flex-1'>
                                    <button
                                        onClick={() => {
                                            const statuses: Task['status'][] = ['backlog', 'todo', 'in-progress', 'in-review', 'done'];
                                            const currentIndex = statuses.indexOf(task.status);
                                            const nextStatus = statuses[Math.min(currentIndex + 1, statuses.length - 1)];
                                            if (nextStatus !== task.status) {
                                                updateTaskStatus(task.id, nextStatus);
                                            }
                                        }}
                                        className={`mt-0.5 ${statusConfig[task.status].color} hover:opacity-70`}>
                                        <StatusIcon className='h-4 w-4' />
                                    </button>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <h3 className='font-medium'>{task.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${priorityConfig[task.priority].color}`}>
                                                {priorityConfig[task.priority].label}
                                            </span>
                                            {task.labels.map((label) => (
                                                <span key={label} className='px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground'>
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                        <p className='text-sm text-muted-foreground mb-2'>{task.description}</p>
                                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                            <span className='flex items-center gap-1'>
                                                <User className='h-3 w-3' />
                                                {task.assignee === 'me' ? 'Me' : 'Assistant'}
                                            </span>
                                            <span>Created {task.createdAt}</span>
                                            {task.dueDate && <span className='text-orange-600'>Due {task.dueDate}</span>}
                                            {task.estimate && <span>{task.estimate} estimated</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[task.status].bg} ${statusConfig[task.status].color}`}>
                                        {statusConfig[task.status].label}
                                    </span>
                                    <button className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                        <MoreHorizontal className='h-4 w-4' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredTasks.length === 0 && (
                <div className='text-center py-12'>
                    <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50'>
                        <CheckCircle2 className='h-8 w-8 text-muted-foreground' />
                    </div>
                    <h3 className='text-lg font-semibold'>No tasks found</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                        {searchQuery ? 'Try adjusting your search' : 'Create your first task to get started'}
                    </p>
                </div>
            )}
        </div>
    );
}