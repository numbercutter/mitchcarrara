'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, X, MessageSquare, ChevronRight, ChevronLeft, History, Search, Plus, Calendar, Archive } from 'lucide-react';

interface ChatMessage {
    id: string;
    sender: 'me' | 'assistant';
    message: string;
    timestamp: string;
    type: 'text' | 'task' | 'file';
    metadata?: {
        taskId?: string;
        fileName?: string;
        taskTitle?: string;
    };
}

interface ChatThread {
    id: string;
    title: string;
    date: string;
    messages: ChatMessage[];
    lastMessage: string;
    timestamp: string;
    messageCount: number;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [currentThreadId, setCurrentThreadId] = useState<string>('');
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get today's thread ID
    const getTodaysThreadId = () => {
        const today = new Date().toISOString().split('T')[0];
        return `thread-${today}`;
    };

    // Initialize or get today's thread
    const initializeTodaysThread = () => {
        const todaysId = getTodaysThreadId();
        const existingThread = threads.find(t => t.id === todaysId);
        
        if (!existingThread) {
            const newThread: ChatThread = {
                id: todaysId,
                title: `Chat - ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString().split('T')[0],
                messages: [{
                    id: '1',
                    sender: 'assistant',
                    message: 'Hi! I\'m your assistant. I\'m here to help with any tasks or questions you have.',
                    timestamp: new Date().toISOString(),
                    type: 'text'
                }],
                lastMessage: 'Hi! I\'m your assistant. I\'m here to help with any tasks or questions you have.',
                timestamp: new Date().toISOString(),
                messageCount: 1
            };
            setThreads(prev => [newThread, ...prev]);
            setCurrentThreadId(todaysId);
            return newThread;
        }
        
        setCurrentThreadId(todaysId);
        return existingThread;
    };

    // Get current thread
    const getCurrentThread = () => {
        return threads.find(t => t.id === currentThreadId);
    };

    // Get current messages
    const getCurrentMessages = () => {
        const thread = getCurrentThread();
        return thread?.messages || [];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load from localStorage and initialize today's thread
    useEffect(() => {
        const savedThreads = localStorage.getItem('chat-threads');
        if (savedThreads) {
            const parsedThreads = JSON.parse(savedThreads);
            setThreads(parsedThreads);
            // Set current thread to today or most recent
            const todaysId = getTodaysThreadId();
            const todaysThread = parsedThreads.find((t: ChatThread) => t.id === todaysId);
            if (todaysThread) {
                setCurrentThreadId(todaysId);
            } else {
                initializeTodaysThread();
            }
        } else {
            initializeTodaysThread();
        }
    }, []);

    // Save to localStorage whenever threads change
    useEffect(() => {
        if (threads.length > 0) {
            localStorage.setItem('chat-threads', JSON.stringify(threads));
        }
    }, [threads]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [currentThreadId]);

    // Auto-switch to today's thread if it doesn't exist
    useEffect(() => {
        const todaysId = getTodaysThreadId();
        if (currentThreadId && currentThreadId !== todaysId) {
            const todaysThread = threads.find(t => t.id === todaysId);
            if (!todaysThread) {
                initializeTodaysThread();
            }
        }
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            sender: 'me',
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
            type: 'text'
        };

        // Add message to current thread
        setThreads(prev => prev.map(thread => {
            if (thread.id === currentThreadId) {
                const updatedMessages = [...thread.messages, message];
                return {
                    ...thread,
                    messages: updatedMessages,
                    lastMessage: message.message,
                    timestamp: message.timestamp,
                    messageCount: updatedMessages.length
                };
            }
            return thread;
        }));

        setNewMessage('');
        setIsTyping(true);

        // Simulate assistant response
        setTimeout(() => {
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'assistant',
                message: 'I received your message: "' + message.message + '". How can I help you with this?',
                timestamp: new Date().toISOString(),
                type: 'text'
            };
            
            setThreads(prev => prev.map(thread => {
                if (thread.id === currentThreadId) {
                    const updatedMessages = [...thread.messages, assistantMessage];
                    return {
                        ...thread,
                        messages: updatedMessages,
                        lastMessage: assistantMessage.message,
                        timestamp: assistantMessage.timestamp,
                        messageCount: updatedMessages.length
                    };
                }
                return thread;
            }));
            setIsTyping(false);
        }, 1000);
    };

    // Filter threads based on search
    const filteredThreads = threads.filter(thread => 
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.messages.some(msg => msg.message.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Switch to a thread
    const switchToThread = (threadId: string) => {
        setCurrentThreadId(threadId);
        setShowHistory(false);
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
            minute: '2-digit'
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                title="Open Chat"
            >
                <MessageSquare className="h-6 w-6" />
            </button>
        );
    }

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden ${isOpen ? '' : 'hidden'}`}
                onClick={onToggle}
            />
            
            {/* Chat Sidebar */}
            <div className="fixed right-0 top-0 z-50 h-full w-80 flex flex-col border-l border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">
                            {showHistory ? 'Chat History' : 'Assistant Chat'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="rounded-md p-2 text-foreground/70 hover:bg-secondary/50 hover:text-foreground transition-colors"
                            title={showHistory ? "Back to Chat" : "View History"}
                        >
                            {showHistory ? <MessageSquare className="h-4 w-4" /> : <History className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={onToggle}
                            className="rounded-md p-2 text-foreground/70 hover:bg-secondary/50 hover:text-foreground transition-colors"
                            title="Minimize Chat"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onToggle}
                            className="rounded-md p-2 text-foreground/70 hover:bg-secondary/50 hover:text-foreground transition-colors lg:hidden"
                            title="Close Chat"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {showHistory ? (
                    /* History Panel */
                    <>
                        {/* Search */}
                        <div className="p-4 border-b border-border/50">
                            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-background/50 p-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search chat history..."
                                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Thread List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {filteredThreads.map((thread) => (
                                <div
                                    key={thread.id}
                                    onClick={() => switchToThread(thread.id)}
                                    className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-secondary/50 ${
                                        thread.id === currentThreadId ? 'border-primary bg-primary/10' : 'border-border/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-sm text-foreground truncate">{thread.title}</h3>
                                        <span className="text-xs text-muted-foreground">
                                            {thread.messageCount} msgs
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mb-2">
                                        {thread.lastMessage}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(thread.date).toLocaleDateString()}</span>
                                        <span>{formatTime(thread.timestamp)}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredThreads.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    <Archive className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm">No chat history found</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Current Chat */
                    <>

                        {/* Current Thread Info */}
                        {getCurrentThread() && (
                            <div className="p-3 border-b border-border/50 bg-secondary/20">
                                <div className="text-sm font-medium text-foreground">
                                    {getCurrentThread()?.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getCurrentMessages().length} messages
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {getCurrentMessages().map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                    message.sender === 'me'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary/50 text-foreground'
                                }`}
                            >
                                <p className="text-sm">{message.message}</p>
                                {message.type === 'task' && message.metadata?.taskTitle && (
                                    <div className="mt-2 rounded bg-background/20 p-2">
                                        <p className="text-xs font-medium">Task: {message.metadata.taskTitle}</p>
                                    </div>
                                )}
                                <p className="mt-1 text-xs opacity-70">{formatTime(message.timestamp)}</p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-lg bg-secondary/50 px-3 py-2">
                                <div className="flex space-x-1">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"></div>
                                </div>
                            </div>
                        </div>
                    )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="border-t border-border/50 p-4">
                            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-background/50 p-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask your assistant..."
                                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || isTyping}
                                    className="rounded-md p-1.5 text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}