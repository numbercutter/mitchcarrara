'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, User, Flag, Tag, Save, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/types/database';

type Task = Tables<'tasks'> & {
    payment_status?: 'paid' | 'unpaid' | 'pending' | null;
    payment_amount?: number | null;
    payment_date?: string | null;
    payment_notes?: string | null;
};

interface TaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => Promise<void>;
    onDelete?: (taskId: string) => Promise<void>;
}

const statusConfig = {
    backlog: { label: 'Backlog', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', emoji: '📦' },
    todo: { label: 'Todo', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300', emoji: '📋' },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300', emoji: '⚡' },
    'in-review': { label: 'In Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300', emoji: '👀' },
    done: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300', emoji: '✅' },
};

const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', emoji: '🔹' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300', emoji: '🔸' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300', emoji: '🔶' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300', emoji: '🔴' },
};

export default function TaskModal({ task, isOpen, onClose, onSave, onDelete }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<string>('todo');
    const [priority, setPriority] = useState<string>('medium');
    const [assignee, setAssignee] = useState<string>('me');
    const [dueDate, setDueDate] = useState('');
    const [estimate, setEstimate] = useState('');
    const [labels, setLabels] = useState<string[]>([]);
    const [newLabel, setNewLabel] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    // Initialize form data when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setStatus(task.status || 'todo');
            setPriority(task.priority || 'medium');
            setAssignee(task.assignee || 'me');
            setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
            setEstimate(task.estimate || '');
            setLabels(task.labels || []);
        } else {
            // Reset for new task
            setTitle('');
            setDescription('');
            setStatus('todo');
            setPriority('medium');
            setAssignee('me');
            setDueDate('');
            setEstimate('');
            setLabels([]);
        }
        setHasChanges(false);
    }, [task]);

    // Focus title when modal opens
    useEffect(() => {
        if (isOpen && titleRef.current) {
            setTimeout(() => titleRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Track changes
    useEffect(() => {
        if (task) {
            const changed =
                title !== (task.title || '') ||
                description !== (task.description || '') ||
                status !== (task.status || 'todo') ||
                priority !== (task.priority || 'medium') ||
                assignee !== (task.assignee || 'me') ||
                dueDate !== (task.due_date ? task.due_date.split('T')[0] : '') ||
                estimate !== (task.estimate || '') ||
                JSON.stringify(labels) !== JSON.stringify(task.labels || []);
            setHasChanges(changed);
        } else {
            setHasChanges(title.trim().length > 0 || description.trim().length > 0);
        }
    }, [title, description, status, priority, assignee, dueDate, estimate, labels, task]);

    const handleSave = async () => {
        if (!title.trim()) return;

        setIsSaving(true);
        try {
            await onSave({
                id: task?.id,
                title: title.trim(),
                description: description.trim() || null,
                status,
                priority,
                assignee,
                due_date: dueDate || null,
                estimate: estimate || null,
                labels: labels.length > 0 ? labels : null,
            });
            setHasChanges(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!task?.id || !onDelete) return;
        if (!confirm('Delete this task? This action cannot be undone.')) return;

        try {
            await onDelete(task.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const addLabel = () => {
        if (newLabel.trim() && !labels.includes(newLabel.trim())) {
            setLabels([...labels, newLabel.trim()]);
            setNewLabel('');
        }
    };

    const removeLabel = (labelToRemove: string) => {
        setLabels(labels.filter((label) => label !== labelToRemove));
    };

    // Auto-resize textarea
    const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 120) + 'px';
    };

    const copyTaskUrl = () => {
        const url = `${window.location.origin}/dashboard/tasks/manage?task=${task?.id}`;
        navigator.clipboard.writeText(url);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm' onClick={onClose} />

            {/* Modal */}
            <div className='fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border bg-card shadow-2xl'>
                {/* Header */}
                <div className='flex items-center justify-between border-b px-6 py-4'>
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2'>
                            <span className='text-lg'>{statusConfig[status as keyof typeof statusConfig]?.emoji || '📋'}</span>
                            <h2 className='text-lg font-semibold'>{task ? 'Edit Task' : 'New Task'}</h2>
                        </div>
                        {task && (
                            <Badge variant='outline' className='text-xs'>
                                #{task.id.slice(-6)}
                            </Badge>
                        )}
                    </div>

                    <div className='flex items-center gap-2'>
                        {task && (
                            <Button variant='ghost' size='sm' onClick={copyTaskUrl}>
                                <Copy className='h-4 w-4' />
                            </Button>
                        )}
                        <Button variant='ghost' size='sm' onClick={onClose}>
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className='flex flex-col overflow-hidden'>
                    {/* Main content area */}
                    <div className='flex-1 space-y-6 overflow-y-auto p-6'>
                        {/* Title */}
                        <div>
                            <input
                                ref={titleRef}
                                type='text'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Task title...'
                                className='w-full border-none bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground'
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        descriptionRef.current?.focus();
                                    }
                                }}
                            />
                        </div>

                        {/* Properties */}
                        <div className='flex flex-wrap gap-2'>
                            {/* Status */}
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={`cursor-pointer rounded-md border-none px-3 py-1 text-sm font-medium outline-none ${statusConfig[status as keyof typeof statusConfig]?.color || statusConfig.todo.color}`}>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <option key={key} value={key}>
                                        {config.emoji} {config.label}
                                    </option>
                                ))}
                            </select>

                            {/* Priority */}
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className={`cursor-pointer rounded-md border-none px-3 py-1 text-sm font-medium outline-none ${priorityConfig[priority as keyof typeof priorityConfig]?.color || priorityConfig.medium.color}`}>
                                {Object.entries(priorityConfig).map(([key, config]) => (
                                    <option key={key} value={key}>
                                        {config.emoji} {config.label}
                                    </option>
                                ))}
                            </select>

                            {/* Assignee */}
                            <select
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className='cursor-pointer rounded-md border-none bg-secondary/50 px-3 py-1 text-sm font-medium outline-none'>
                                <option value='me'>👤 Me</option>
                                <option value='assistant'>🤖 Assistant</option>
                            </select>

                            {/* Due Date */}
                            <div className='flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1'>
                                <Calendar className='h-4 w-4 text-muted-foreground' />
                                <input type='date' value={dueDate} onChange={(e) => setDueDate(e.target.value)} className='border-none bg-transparent text-sm outline-none' />
                            </div>

                            {/* Estimate */}
                            <div className='flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1'>
                                <Clock className='h-4 w-4 text-muted-foreground' />
                                <input
                                    type='text'
                                    value={estimate}
                                    onChange={(e) => setEstimate(e.target.value)}
                                    placeholder='2h'
                                    className='w-12 border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                                />
                            </div>
                        </div>

                        {/* Labels */}
                        <div className='space-y-2'>
                            <div className='flex flex-wrap gap-2'>
                                {labels.map((label) => (
                                    <Badge key={label} variant='secondary' className='gap-1'>
                                        <Tag className='h-3 w-3' />
                                        {label}
                                        <button onClick={() => removeLabel(label)} className='ml-1 hover:text-destructive'>
                                            <X className='h-3 w-3' />
                                        </button>
                                    </Badge>
                                ))}
                                <div className='flex items-center'>
                                    <input
                                        type='text'
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addLabel();
                                            }
                                        }}
                                        placeholder='Add label...'
                                        className='w-20 border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <textarea
                                ref={descriptionRef}
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    adjustTextareaHeight(e.target);
                                }}
                                placeholder='Add a description...'
                                className='min-h-[120px] w-full resize-none border-none bg-transparent leading-relaxed outline-none placeholder:text-muted-foreground'
                                style={{ height: 'auto' }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='border-t bg-secondary/20 px-6 py-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                {task && task.created_at && <span className='text-xs text-muted-foreground'>Created {new Date(task.created_at).toLocaleDateString()}</span>}
                                {hasChanges && (
                                    <Badge variant='outline' className='text-xs'>
                                        Unsaved changes
                                    </Badge>
                                )}
                            </div>

                            <div className='flex items-center gap-2'>
                                {task && onDelete && (
                                    <Button variant='destructive' size='sm' onClick={handleDelete}>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                )}
                                <Button variant='outline' onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={!title.trim() || isSaving}>
                                    <Save className='mr-2 h-4 w-4' />
                                    {isSaving ? 'Saving...' : task ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
