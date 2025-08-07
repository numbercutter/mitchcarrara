'use client';

import { useState } from 'react';
import { Plus, Send, Check, Clock, User, MessageSquare, CheckSquare, AlertCircle } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignedTo: 'me' | 'assistant';
    createdAt: string;
    dueDate?: string;
}

interface ChatMessage {
    id: string;
    sender: 'me' | 'assistant';
    message: string;
    timestamp: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: 'Review Q1 Financial Reports',
            description: 'Go through all company financial reports for Q1 and prepare summary',
            status: 'pending',
            priority: 'high',
            assignedTo: 'assistant',
            createdAt: '2024-01-15',
            dueDate: '2024-01-20'
        },
        {
            id: '2',
            title: 'Schedule investor meetings',
            description: 'Coordinate with 5 potential investors for Series A discussions',
            status: 'in-progress',
            priority: 'high',
            assignedTo: 'assistant',
            createdAt: '2024-01-14'
        },
        {
            id: '3',
            title: 'Complete product roadmap',
            description: 'Finalize Q2 product roadmap with engineering team input',
            status: 'completed',
            priority: 'medium',
            assignedTo: 'me',
            createdAt: '2024-01-10'
        }
    ]);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'assistant',
            message: 'Hi! I\'ve started working on the financial reports review. I should have the summary ready by tomorrow.',
            timestamp: '2024-01-15T10:30:00'
        },
        {
            id: '2',
            sender: 'me',
            message: 'Perfect! Also, can you prioritize the investor meetings? We need those scheduled ASAP.',
            timestamp: '2024-01-15T11:15:00'
        },
        {
            id: '3',
            sender: 'assistant',
            message: 'Absolutely! I\'ll reach out to all 5 investors today and aim to have meetings scheduled by end of week.',
            timestamp: '2024-01-15T11:20:00'
        }
    ]);

    const [newMessage, setNewMessage] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        
        const message: ChatMessage = {
            id: Date.now().toString(),
            sender: 'me',
            message: newMessage,
            timestamp: new Date().toISOString()
        };
        
        setChatMessages([...chatMessages, message]);
        setNewMessage('');
    };

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        
        const task: Task = {
            id: Date.now().toString(),
            title: newTaskTitle,
            description: newTaskDescription,
            status: 'pending',
            priority: 'medium',
            assignedTo: 'assistant',
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        setTasks([...tasks, task]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setShowNewTaskForm(false);
    };

    const updateTaskStatus = (taskId: string, status: Task['status']) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, status } : task
        ));
    };

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
            case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
            default: return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
        }
    };

    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
        }
    };

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-3xl font-bold'>Assistant Tasks & Communication</h1>
                <p className='mt-2 text-muted-foreground'>Manage tasks and communicate with your assistant in one place.</p>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Task Management */}
                <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-xl font-semibold flex items-center gap-2'>
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
                        <div className='rounded-lg border bg-card p-4 space-y-3'>
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
                                <button
                                    onClick={() => setShowNewTaskForm(false)}
                                    className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'>
                                    Cancel
                                </button>
                                <button
                                    onClick={addTask}
                                    className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                                    Add Task
                                </button>
                            </div>
                        </div>
                    )}

                    <div className='space-y-3 max-h-96 overflow-y-auto'>
                        {tasks.map((task) => (
                            <div key={task.id} className='rounded-lg border bg-card p-4'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <h3 className='font-medium text-sm'>{task.title}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <p className='text-xs text-muted-foreground mb-2'>{task.description}</p>
                                        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                                            <span className='flex items-center gap-1'>
                                                <User className='h-3 w-3' />
                                                {task.assignedTo === 'me' ? 'Me' : 'Assistant'}
                                            </span>
                                            <span className='flex items-center gap-1'>
                                                <Clock className='h-3 w-3' />
                                                {task.createdAt}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                        {task.status !== 'completed' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
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
                <div className='space-y-4'>
                    <h2 className='text-xl font-semibold flex items-center gap-2'>
                        <MessageSquare className='h-5 w-5' />
                        Chat with Assistant
                    </h2>

                    <div className='rounded-lg border bg-card'>
                        {/* Messages */}
                        <div className='h-80 overflow-y-auto p-4 space-y-3'>
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs rounded-lg p-3 text-sm ${
                                        msg.sender === 'me' 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'bg-secondary text-secondary-foreground'
                                    }`}>
                                        <p>{msg.message}</p>
                                        <p className={`mt-1 text-xs ${
                                            msg.sender === 'me' 
                                                ? 'text-primary-foreground/70' 
                                                : 'text-muted-foreground'
                                        }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString()}
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

            {/* Quick Stats */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2'>
                        <AlertCircle className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                        <span className='text-sm text-muted-foreground'>Pending Tasks</span>
                    </div>
                    <p className='text-xl font-bold'>
                        {tasks.filter(t => t.status === 'pending').length}
                    </p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                        <span className='text-sm text-muted-foreground'>In Progress</span>
                    </div>
                    <p className='text-xl font-bold'>
                        {tasks.filter(t => t.status === 'in-progress').length}
                    </p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2'>
                        <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
                        <span className='text-sm text-muted-foreground'>Completed</span>
                    </div>
                    <p className='text-xl font-bold'>
                        {tasks.filter(t => t.status === 'completed').length}
                    </p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2'>
                        <MessageSquare className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                        <span className='text-sm text-muted-foreground'>Messages Today</span>
                    </div>
                    <p className='text-xl font-bold'>{chatMessages.length}</p>
                </div>
            </div>
        </div>
    );
}