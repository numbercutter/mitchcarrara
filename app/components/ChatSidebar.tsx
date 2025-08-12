'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, X, MessageSquare, ChevronRight, ChevronLeft, History, Search, Plus, Calendar, Archive } from 'lucide-react';

interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    content: string;
    created_at: string;
    message_type: 'text' | 'task' | 'file' | 'system';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
            fetchConversations();
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
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

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className='fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90'
                title='Open Chat'>
                <MessageSquare className='h-6 w-6' />
            </button>
        );
    }

    return (
        <>
            {/* Overlay for mobile */}
            <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden ${isOpen ? '' : 'hidden'}`} onClick={onToggle} />

            {/* Chat Sidebar */}
            <div className='fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]'>
                {/* Header */}
                <div className='flex h-16 items-center justify-between border-b border-border/50 px-4'>
                    <div className='flex items-center gap-3'>
                        <MessageSquare className='h-5 w-5 text-primary' />
                        <span className='font-semibold text-foreground'>{showHistory ? 'Chat History' : 'Assistant Chat'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
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
                            {filteredThreads.map((thread) => (
                                <div
                                    key={thread.id}
                                    onClick={() => switchToThread(thread.id)}
                                    className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-secondary/50 ${
                                        thread.id === currentThreadId ? 'border-primary bg-primary/10' : 'border-border/50'
                                    }`}>
                                    <div className='mb-2 flex items-center justify-between'>
                                        <h3 className='truncate text-sm font-medium text-foreground'>{thread.title}</h3>
                                        <span className='text-xs text-muted-foreground'>{thread.messageCount || 0} msgs</span>
                                    </div>
                                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                        <Calendar className='h-3 w-3' />
                                        <span>{formatDate(thread.updated_at)}</span>
                                        <span>{formatTime(thread.updated_at)}</span>
                                    </div>
                                </div>
                            ))}
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
                                <div className='text-sm font-medium text-foreground'>{getCurrentThread()?.title}</div>
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
                                    <div
                                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                            message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-foreground'
                                        }`}>
                                        <p className='text-sm'>{message.content}</p>
                                        {message.message_type === 'task' && message.metadata?.taskTitle && (
                                            <div className='mt-2 rounded bg-background/20 p-2'>
                                                <p className='text-xs font-medium'>Task: {message.metadata.taskTitle}</p>
                                            </div>
                                        )}
                                        <p className='mt-1 text-xs opacity-70'>{formatTime(message.created_at)}</p>
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
                            <div className='flex items-center gap-2 rounded-md border border-border/50 bg-background/50 p-2'>
                                <input
                                    ref={inputRef}
                                    type='text'
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder='Ask your assistant...'
                                    className='flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none'
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || isTyping}
                                    className='rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50'>
                                    <Send className='h-4 w-4' />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
