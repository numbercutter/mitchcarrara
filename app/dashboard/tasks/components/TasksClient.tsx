'use client';

import { useState } from 'react';
import { Plus, Send, Check, Clock, User, MessageSquare, CheckSquare, AlertCircle } from 'lucide-react';
import { Tables } from '@/types/database';
import { formatTimeAgo, getPriorityColor, getStatusColor } from '@/lib/database/utils';

// Type helpers
type Task = Tables<'tasks'>;
type TaskChatMessage = Tables<'task_chat_messages'>;

interface TasksClientProps {
    initialTasks: Task[];
    initialChatMessages: TaskChatMessage[];
}

export default function TasksClient({ initialTasks, initialChatMessages }: TasksClientProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [chatMessages, setChatMessages] = useState<TaskChatMessage[]>(initialChatMessages);
    const [newMessage, setNewMessage] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageToSend = newMessage;
        const tempMessage: TaskChatMessage = {
            id: Date.now().toString(),
            sender: 'me',
            message: messageToSend,
            created_at: new Date().toISOString(),
            user_id: 'user-1', // This would come from auth
        };

        setChatMessages([...chatMessages, tempMessage]);
        setNewMessage('');

        try {
            const response = await fetch('/api/task-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: 'me',
                    message: messageToSend,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save message');
            }

            const savedMessage = await response.json();
            // Update the temp message with the real ID
            setChatMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? savedMessage : msg)));
        } catch (error) {
            console.error('Error saving message:', error);
            // Optionally remove the temp message or show error
            setChatMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        }
    };

    const addTask = async () => {
        if (!newTaskTitle.trim()) return;

        const titleToSave = newTaskTitle;
        const descriptionToSave = newTaskDescription;
        const tempTask: Task = {
            id: Date.now().toString(),
            title: titleToSave,
            description: descriptionToSave,
            status: 'todo',
            priority: 'medium',
            assignee: 'assistant',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            due_date: null,
            estimate: null,
            labels: null,
            user_id: 'user-1', // This would come from auth
        };

        setTasks([...tasks, tempTask]);
        setNewTaskTitle('');
        setNewTaskDescription('');
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
                    priority: 'medium',
                    assignee: 'assistant',
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

    const taskStats = {
        backlog: tasks.filter((t) => t.status === 'backlog').length,
        todo: tasks.filter((t) => t.status === 'todo' || t.status === null).length,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        inReview: tasks.filter((t) => t.status === 'in-review').length,
        done: tasks.filter((t) => t.status === 'done').length,
    };

    return (
        <div className='flex h-full flex-col'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm pb-6'>
                <div>
                    <h1 className='text-3xl font-bold'>Assistant Tasks & Communication</h1>
                    <p className='mt-2 text-muted-foreground'>Manage tasks and communicate with your assistant in one place.</p>
                </div>
                
                {/* Task Stats - Always visible */}
                <div className='mt-6 grid grid-cols-5 gap-4'>
                    <div className='rounded-lg border bg-card p-3 text-center'>
                        <div className='text-lg font-semibold text-red-600'>{taskStats.backlog}</div>
                        <div className='text-xs text-muted-foreground'>Backlog</div>
                    </div>
                    <div className='rounded-lg border bg-card p-3 text-center'>
                        <div className='text-lg font-semibold text-blue-600'>{taskStats.todo}</div>
                        <div className='text-xs text-muted-foreground'>To Do</div>
                    </div>
                    <div className='rounded-lg border bg-card p-3 text-center'>
                        <div className='text-lg font-semibold text-yellow-600'>{taskStats.inProgress}</div>
                        <div className='text-xs text-muted-foreground'>In Progress</div>
                    </div>
                    <div className='rounded-lg border bg-card p-3 text-center'>
                        <div className='text-lg font-semibold text-purple-600'>{taskStats.inReview}</div>
                        <div className='text-xs text-muted-foreground'>In Review</div>
                    </div>
                    <div className='rounded-lg border bg-card p-3 text-center'>
                        <div className='text-lg font-semibold text-green-600'>{taskStats.done}</div>
                        <div className='text-xs text-muted-foreground'>Done</div>
                    </div>
                </div>
            </div>
            
            {/* Scrollable Content */}
            <div className='flex-1 overflow-hidden pt-6'>
                <div className='grid h-full grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Task Management */}
                <div className='flex h-full flex-col space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h2 className='flex items-center gap-2 text-xl font-semibold'>
                            <CheckSquare className='h-5 w-5' />
                            Task Management
                        </h2>
                        <button
                            onClick={() => setShowNewTaskForm(true)}
                            className='flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                            <Plus className='h-4 w-4' />
                            Add Task
                        </button>
                    </div>

                    {showNewTaskForm && (
                        <div className='space-y-3 rounded-lg border bg-card p-4'>
                            <input
                                type='text'
                                placeholder='Task title...'
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                            />
                            <textarea
                                placeholder='Task description...'
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                className='w-full resize-none rounded border bg-background px-3 py-2 text-sm'
                                rows={3}
                            />
                            <div className='flex justify-end gap-2'>
                                <button onClick={() => setShowNewTaskForm(false)} className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'>
                                    Cancel
                                </button>
                                <button onClick={addTask} className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                                    Add Task
                                </button>
                            </div>
                        </div>
                    )}

                    <div className='flex-1 space-y-3 overflow-y-auto'>
                        {tasks.map((task) => (
                            <div key={task.id} className='rounded-lg border bg-card p-4'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <div className='mb-2 flex items-center gap-2'>
                                            <h3 className='text-sm font-medium'>{task.title}</h3>
                                            {task.priority && <span className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</span>}
                                        </div>
                                        {task.description && <p className='mb-2 text-xs text-muted-foreground'>{task.description}</p>}
                                        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                                            <span className='flex items-center gap-1'>
                                                <User className='h-3 w-3' />
                                                {task.assignee === 'me' ? 'Me' : 'Assistant'}
                                            </span>
                                            <span className='flex items-center gap-1'>
                                                <Clock className='h-3 w-3' />
                                                {task.created_at ? formatTimeAgo(task.created_at) : 'No date'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        {task.status && <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(task.status)}`}>{task.status}</span>}
                                        {task.status !== 'done' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, task.status === 'todo' ? 'in-progress' : 'done')}
                                                className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                                <Check className='h-3 w-3' />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Interface */}
                <div className='flex h-full flex-col space-y-4'>
                    <h2 className='flex items-center gap-2 text-xl font-semibold'>
                        <MessageSquare className='h-5 w-5' />
                        Chat with Assistant
                    </h2>

                    <div className='flex flex-1 flex-col rounded-lg border bg-card'>
                        {/* Messages */}
                        <div className='flex-1 space-y-3 overflow-y-auto p-4'>
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-xs rounded-lg p-3 text-sm ${
                                            msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                                        }`}>
                                        <p>{msg.message}</p>
                                        <p className={`mt-1 text-xs ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className='border-t p-4'>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    placeholder='Type your message...'
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    className='flex-1 rounded border bg-background px-3 py-2 text-sm'
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className='flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50'>
                                    <Send className='h-4 w-4' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
