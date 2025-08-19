'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, X, MessageSquare, ChevronRight, ChevronLeft, History, Search, Plus, Calendar, Archive } from 'lucide-react';

interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    content: string;
    created_at: string;
    message_type: 'text' | 'task' | 'file' | 'system';
    user_id?: string;
    metadata?: {
        taskId?: string;
        fileName?: string;
        taskTitle?: string;
    };
}

interface ChatThread {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    messageCount: number;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [currentThreadId, setCurrentThreadId] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastMessageCountRef = useRef<number>(0);

    // Fetch conversations from database
    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/chat/conversations');
            if (response.ok) {
                const conversations = await response.json();
                setThreads(conversations);

                // Set current thread to most recent if none selected
                if (!currentThreadId && conversations.length > 0) {
                    setCurrentThreadId(conversations[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    // Fetch messages for current thread
    const fetchMessages = async (threadId: string) => {
        if (!threadId) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/chat/conversations/${threadId}/messages`);
            if (response.ok) {
                const newMessages = await response.json();

                // Check for new messages when sidebar is closed
                if (!isOpen && newMessages.length > lastMessageCountRef.current) {
                    setHasNewMessages(true);
                }

                lastMessageCountRef.current = newMessages.length;
                setMessages(newMessages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create today's conversation if it doesn't exist
    const createTodaysConversation = async () => {
        try {
            const title = `Chat - ${new Date().toLocaleDateString()}`;
            const response = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });

            if (response.ok) {
                const newConversation = await response.json();
                setThreads((prev) => [newConversation, ...prev]);
                setCurrentThreadId(newConversation.id);
                return newConversation;
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    // Get or create today's conversation
    const getTodaysConversation = async () => {
        const todayTitle = `Chat - ${new Date().toLocaleDateString()}`;
        const existingThread = threads.find((t) => t.title === todayTitle);

        if (existingThread) {
            setCurrentThreadId(existingThread.id);
            setShowHistory(false);
            return existingThread;
        } else {
            const newConversation = await createTodaysConversation();
            setShowHistory(false);
            return newConversation;
        }
    };

    // Poll for new messages every minute
    const startPolling = (threadId: string) => {
        // Clear existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Start new polling interval
        pollingIntervalRef.current = setInterval(() => {
            fetchMessages(threadId);
        }, 60000); // Poll every 60 seconds (1 minute)
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Initialize chat when sidebar opens
    useEffect(() => {
        if (isOpen) {
            setHasNewMessages(false); // Clear notifications when opening
            fetchConversations().then(() => {
                // Auto-select today's conversation if no thread is selected
                if (!currentThreadId) {
                    const todayTitle = `Chat - ${new Date().toLocaleDateString()}`;
                    const todaysThread = threads.find((t) => t.title === todayTitle);
                    if (todaysThread) {
                        setCurrentThreadId(todaysThread.id);
                    }
                }
            });

            // Focus textarea when sidebar opens (after a small delay for animation)
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen]);

    // Fetch messages when thread changes and start polling
    useEffect(() => {
        if (currentThreadId) {
            fetchMessages(currentThreadId);
            startPolling(currentThreadId);
        }

        return () => {
            stopPolling();
        };
    }, [currentThreadId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setIsTyping(true);

        try {
            // If no current thread, create today's conversation
            let threadId = currentThreadId;
            if (!threadId) {
                const newConversation = await createTodaysConversation();
                threadId = newConversation?.id;
            }

            if (!threadId) {
                throw new Error('No conversation available');
            }

            // Send message via API
            const response = await fetch(`/api/chat/conversations/${threadId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: messageContent,
                    sender: 'user',
                    message_type: 'text',
                }),
            });

            if (response.ok) {
                // Refresh messages to show new message
                await fetchMessages(threadId);

                // Refresh conversations list to update timestamps
                await fetchConversations();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Restore the message if it failed
            setNewMessage(messageContent);
        } finally {
            setIsTyping(false);
        }
    };

    // Filter threads based on search
    const filteredThreads = threads.filter((thread) => thread.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Switch to a thread
    const switchToThread = (threadId: string) => {
        setCurrentThreadId(threadId);
        setShowHistory(false);
    };

    // Get current thread
    const getCurrentThread = () => {
        return threads.find((t) => t.id === currentThreadId);
    };

    // Auto-resize textarea helper
    const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString();
    };

    const getUserDisplayName = (message: ChatMessage) => {
        if (message.sender === 'assistant') {
            return 'Assistant';
        }

        return 'You';
    };

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className='fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90'
                title='Open Chat'>
                <MessageSquare className='h-6 w-6' />
                {hasNewMessages && (
                    <div className='absolute -right-1 -top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-red-500'>
                        <span className='text-xs font-bold text-white'>!</span>
                    </div>
                )}
            </button>
        );
    }

    return (
        <>
            {/* Overlay for mobile */}
            <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden ${isOpen ? '' : 'hidden'}`} onClick={onToggle} />

            {/* Chat Sidebar */}
            <div
                className={`fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-transform duration-300 dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className='flex h-16 items-center justify-between border-b border-border/50 px-4'>
                    <div className='flex items-center gap-3'>
                        <MessageSquare className='h-5 w-5 text-primary' />
                        <span className='truncate font-semibold text-foreground'>{showHistory ? 'Chat History' : 'Assistant Chat'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={getTodaysConversation}
                            className='rounded-md p-2 text-foreground/70 transition-colors hover:bg-secondary/50 hover:text-foreground'
                            title="Today's Chat">
                            <Plus className='h-4 w-4' />
                        </button>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className='rounded-md p-2 text-foreground/70 transition-colors hover:bg-secondary/50 hover:text-foreground'
                            title={showHistory ? 'Back to Chat' : 'View History'}>
                            {showHistory ? <MessageSquare className='h-4 w-4' /> : <History className='h-4 w-4' />}
                        </button>
                        <button
                            onClick={onToggle}
                            className='rounded-md p-2 text-foreground/70 transition-colors hover:bg-secondary/50 hover:text-foreground'
                            title='Minimize Chat'>
                            <ChevronRight className='h-4 w-4' />
                        </button>
                        <button
                            onClick={onToggle}
                            className='rounded-md p-2 text-foreground/70 transition-colors hover:bg-secondary/50 hover:text-foreground lg:hidden'
                            title='Close Chat'>
                            <X className='h-4 w-4' />
                        </button>
                    </div>
                </div>

                {showHistory ? (
                    /* History Panel */
                    <>
                        {/* Search */}
                        <div className='border-b border-border/50 p-4'>
                            <div className='flex items-center gap-2 rounded-md border border-border/50 bg-background/50 p-2'>
                                <Search className='h-4 w-4 text-muted-foreground' />
                                <input
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder='Search chat history...'
                                    className='flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none'
                                />
                            </div>
                        </div>

                        {/* Thread List */}
                        <div className='flex-1 space-y-3 overflow-y-auto p-4'>
                            {filteredThreads.map((thread) => {
                                const isToday = thread.title === `Chat - ${new Date().toLocaleDateString()}`;
                                return (
                                    <div
                                        key={thread.id}
                                        onClick={() => switchToThread(thread.id)}
                                        className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-secondary/50 ${
                                            thread.id === currentThreadId ? 'border-primary bg-primary/10' : 'border-border/50'
                                        } ${isToday ? 'ring-2 ring-primary/20' : ''}`}>
                                        <div className='mb-2 flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <h3 className='truncate break-words text-sm font-medium text-foreground'>{thread.title}</h3>
                                                {isToday && <span className='rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary'>Today</span>}
                                            </div>
                                            <span className='text-xs text-muted-foreground'>{thread.messageCount || 0} msgs</span>
                                        </div>
                                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                            <Calendar className='h-3 w-3' />
                                            <span>{formatDate(thread.updated_at)}</span>
                                            <span>{formatTime(thread.updated_at)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredThreads.length === 0 && (
                                <div className='py-8 text-center text-muted-foreground'>
                                    <Archive className='mx-auto mb-2 h-8 w-8' />
                                    <p className='text-sm'>No chat history found</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Current Chat */
                    <>
                        {/* Current Thread Info */}
                        {getCurrentThread() && (
                            <div className='border-b border-border/50 bg-secondary/20 p-3'>
                                <div className='truncate break-words text-sm font-medium text-foreground'>{getCurrentThread()?.title}</div>
                                <div className='text-xs text-muted-foreground'>
                                    {messages.length} messages
                                    {isLoading && ' • Loading...'}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className='flex-1 space-y-4 overflow-y-auto p-4'>
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                                        {/* User name */}
                                        <p className={`mb-1 text-xs font-medium ${message.sender === 'user' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {getUserDisplayName(message)}
                                        </p>

                                        {/* Message bubble */}
                                        <div
                                            className={`rounded-lg px-3 py-2 ${
                                                message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-foreground'
                                            }`}>
                                            <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>{message.content}</p>
                                            {message.message_type === 'task' && message.metadata?.taskTitle && (
                                                <div className='mt-2 rounded bg-background/20 p-2'>
                                                    <p className='break-words text-xs font-medium'>Task: {message.metadata.taskTitle}</p>
                                                </div>
                                            )}
                                            <p className='mt-1 text-xs opacity-70'>{formatTime(message.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {messages.length === 0 && !isLoading && (
                                <div className='py-8 text-center text-muted-foreground'>
                                    <MessageSquare className='mx-auto mb-2 h-8 w-8' />
                                    <p className='text-sm'>No messages yet. Start a conversation!</p>
                                </div>
                            )}

                            {isTyping && (
                                <div className='flex justify-start'>
                                    <div className='max-w-[80%] rounded-lg bg-secondary/50 px-3 py-2'>
                                        <div className='flex space-x-1'>
                                            <div className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]'></div>
                                            <div className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]'></div>
                                            <div className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60'></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className='border-t border-border/50 p-4'>
                            <div className='flex items-end gap-2 rounded-md border border-border/50 bg-background/50 p-2'>
                                <textarea
                                    ref={inputRef}
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        adjustTextareaHeight(e.target);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder='Ask your assistant... (Shift+Enter for new line)'
                                    className='scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent max-h-[7.5rem] min-h-[2.5rem] flex-1 resize-none overflow-y-auto break-words bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none'
                                    style={{ height: '2.5rem' }}
                                    rows={1}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || isTyping}
                                    className='flex-shrink-0 self-end rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50'>
                                    <Send className='h-4 w-4' />
                                </button>
                            </div>
                            <p className='mt-2 text-xs text-muted-foreground'>Tip: Use Shift+Enter for new lines</p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
