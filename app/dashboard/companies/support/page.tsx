'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Search, Send, Clock, CheckCircle2 } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { createClient } from '@/lib/supabase/client';

interface SupportThread {
    id: string;
    product_id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    subject: string | null;
    last_message: string;
    last_message_time: string;
    status: 'open' | 'closed' | 'pending';
    created_at: string;
    updated_at: string;
    metadata: Record<string, any>;
}

interface Message {
    id: string;
    thread_id: string;
    sender_id: string;
    sender_name: string;
    sender_type: 'user' | 'support_team';
    content: string;
    created_at: string;
    metadata: Record<string, any>;
}

export default function SupportPage() {
    const { selectedCompany } = useCompany();
    const [threads, setThreads] = useState<SupportThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Initialize Supabase client
    const supabase = selectedCompany ? createClient() : null;

    useEffect(() => {
        if (!supabase) {
            console.log('No Supabase client available');
            return;
        }

        console.log('Initializing support page for company:', selectedCompany?.id);
        console.log('Supabase URL:', selectedCompany?.supabase.url);

        const fetchThreads = async () => {
            try {
                console.log('Fetching support threads...');
                console.log('Query details:', {
                    table: 'support_threads',
                    company: selectedCompany?.id,
                    supabaseUrl: selectedCompany?.supabase.url,
                });

                // Check current session and user
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();
                console.log('Current session:', {
                    hasSession: !!session,
                    userId: session?.user?.id,
                    userEmail: session?.user?.email,
                    accessToken: session?.access_token ? 'present' : 'missing',
                });
                if (sessionError) {
                    console.error('Session error:', sessionError);
                }

                // Check if we can access the table at all
                const { data: tableCheck, error: tableError } = await supabase.from('support_threads').select('count').limit(1).single();

                console.log('Table access check:', {
                    canAccess: !tableError,
                    error: tableError
                        ? {
                              code: tableError.code,
                              message: tableError.message,
                              details: tableError.details,
                          }
                        : null,
                });

                // Try to get a single thread with minimal fields
                const { data: singleThread, error: singleThreadError } = await supabase.from('support_threads').select('id, user_id').limit(1).single();

                console.log('Single thread test:', {
                    success: !singleThreadError,
                    data: singleThread,
                    error: singleThreadError
                        ? {
                              code: singleThreadError.code,
                              message: singleThreadError.message,
                              details: singleThreadError.details,
                          }
                        : null,
                });

                // Then try to fetch all threads
                const query = supabase.from('support_threads').select('*').order('last_message_time', { ascending: false });
                console.log('Executing full query for support threads...');

                const { data, error } = await query;

                if (error) {
                    console.error('Error fetching support threads:', error);
                    console.log('Error details:', {
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                    });
                    throw error;
                }
                console.log('Fetched threads:', data);
                console.log('Thread count:', data?.length);
                setThreads(data);
            } catch (error) {
                console.error('Error in fetchThreads:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchThreads();

        // Subscribe to new threads
        console.log('Setting up thread subscription...');
        const subscription = supabase
            .channel('support_threads')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'support_threads',
                },
                (payload) => {
                    console.log('Thread subscription event:', payload);
                    if (payload.eventType === 'INSERT') {
                        setThreads((prev) => [payload.new as SupportThread, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setThreads((prev) => prev.map((thread) => (thread.id === payload.new.id ? (payload.new as SupportThread) : thread)));
                    }
                }
            )
            .subscribe();

        return () => {
            console.log('Cleaning up thread subscription');
            subscription.unsubscribe();
        };
    }, [supabase, selectedCompany]);

    useEffect(() => {
        if (!supabase || !selectedThread) {
            console.log('No Supabase client or selected thread available');
            return;
        }

        console.log('Thread selected:', selectedThread.id);
        console.log('Thread details:', selectedThread);

        const fetchMessages = async () => {
            try {
                console.log('Fetching messages for thread:', selectedThread.id);
                console.log('Using Supabase client for company:', selectedCompany?.id);
                const { data, error } = await supabase.from('support_messages').select('*').eq('thread_id', selectedThread.id).order('created_at', { ascending: true });

                if (error) {
                    console.error('Error fetching messages:', error);
                    throw error;
                }
                console.log('Fetched messages:', data);
                setMessages(data);
            } catch (error) {
                console.error('Error in fetchMessages:', error);
            }
        };

        fetchMessages();

        // Subscribe to new messages
        console.log('Setting up message subscription for thread:', selectedThread.id);
        const subscription = supabase
            .channel(`messages:${selectedThread.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `thread_id=eq.${selectedThread.id}`,
                },
                (payload) => {
                    console.log('Message subscription event:', payload);
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            console.log('Cleaning up message subscription for thread:', selectedThread.id);
            subscription.unsubscribe();
        };
    }, [supabase, selectedThread, selectedCompany]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedThread || !supabase) {
            console.log('Cannot send message:', { hasMessage: !!newMessage.trim(), hasThread: !!selectedThread, hasSupabase: !!supabase });
            return;
        }

        try {
            console.log('Sending message for thread:', selectedThread.id);
            // Get the current user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError) {
                console.error('Error getting user:', userError);
                throw userError;
            }
            if (!user) {
                console.error('No authenticated user found');
                throw new Error('No authenticated user found');
            }

            console.log('User authenticated:', user.id);
            const { data, error } = await supabase
                .from('support_messages')
                .insert({
                    thread_id: selectedThread.id,
                    sender_id: user.id,
                    sender_name: user.user_metadata?.full_name || 'Support Team',
                    sender_type: 'support_team',
                    content: newMessage.trim(),
                })
                .select();

            if (error) {
                console.error('Error sending message:', error);
                throw error;
            }

            console.log('Message sent successfully:', data);
            if (data && data[0]) {
                setMessages((prev) => [...prev, data[0]]);
            }
            setNewMessage('');
        } catch (error) {
            console.error('Error in handleSendMessage:', error);
        }
    };

    const handleCloseThread = async () => {
        if (!selectedThread || !supabase) return;

        try {
            const { error } = await supabase.from('support_threads').update({ status: 'closed' }).eq('id', selectedThread.id);

            if (error) throw error;
            setSelectedThread(null);
            // Update the thread in the local state
            setThreads((prev) => prev.map((thread) => (thread.id === selectedThread.id ? { ...thread, status: 'closed' } : thread)));
        } catch (error) {
            console.error('Error closing thread:', error);
        }
    };

    const handleReopenThread = async () => {
        if (!selectedThread || !supabase) return;

        try {
            const { error } = await supabase.from('support_threads').update({ status: 'open' }).eq('id', selectedThread.id);

            if (error) throw error;
            // Update the thread in the local state
            setThreads((prev) => prev.map((thread) => (thread.id === selectedThread.id ? { ...thread, status: 'open' } : thread)));
            setSelectedThread((prev) => (prev ? { ...prev, status: 'open' } : null));
        } catch (error) {
            console.error('Error reopening thread:', error);
        }
    };

    const filteredThreads = threads.filter(
        (thread) => thread.user_name.toLowerCase().includes(searchQuery.toLowerCase()) || thread.user_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className='flex h-[calc(100vh-4rem)] items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
            </div>
        );
    }

    return (
        <div className='flex h-[calc(100vh-4rem)] overflow-hidden'>
            {/* Threads List */}
            <div className='flex w-1/3 flex-col border-r bg-card'>
                <div className='border-b p-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                        <input
                            type='text'
                            placeholder='Search threads...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/10'
                        />
                    </div>
                </div>
                <div className='flex-1 overflow-y-auto'>
                    {filteredThreads.map((thread) => (
                        <div
                            key={thread.id}
                            className={`cursor-pointer border-b p-4 transition-colors hover:bg-secondary ${selectedThread?.id === thread.id ? 'bg-primary/10' : ''}`}
                            onClick={() => setSelectedThread(thread)}>
                            <div className='flex items-center justify-between'>
                                <div className='font-medium'>{thread.user_name}</div>
                                <div className='text-sm text-muted-foreground'>{new Date(thread.last_message_time).toLocaleDateString()}</div>
                            </div>
                            <div className='truncate text-sm text-foreground'>{thread.last_message}</div>
                            <div className='mt-2 flex items-center gap-2'>
                                {thread.status === 'open' ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <Clock className='h-4 w-4 text-muted-foreground' />}
                                <span className='text-xs text-muted-foreground'>{thread.status === 'open' ? 'Open' : 'Closed'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message View */}
            <div className='flex flex-1 flex-col overflow-hidden bg-secondary'>
                {selectedThread ? (
                    <>
                        <div className='flex items-center justify-between border-b bg-card p-4'>
                            <div>
                                <h2 className='text-lg font-semibold'>{selectedThread.user_name}</h2>
                                <p className='text-sm text-muted-foreground'>{selectedThread.user_email}</p>
                            </div>
                            <div className='flex gap-2'>
                                {selectedThread.status === 'open' ? (
                                    <button onClick={handleCloseThread} className='rounded-md px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50'>
                                        Close Thread
                                    </button>
                                ) : (
                                    <button onClick={handleReopenThread} className='rounded-md px-4 py-2 text-sm text-green-600 transition-colors hover:bg-green-50'>
                                        Reopen Thread
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className='flex-1 overflow-y-auto p-4'>
                            <div className='space-y-4'>
                                {messages.map((message) => (
                                    <div key={message.id} className={`flex ${message.sender_id === 'support_team' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${
                                                message.sender_id === 'support_team' ? 'bg-primary/10' : 'bg-card text-foreground shadow-sm'
                                            }`}>
                                            <div className='mb-1 text-sm font-medium'>{message.sender_name}</div>
                                            <div className='text-sm'>{message.content}</div>
                                            <div className='mt-1 text-xs opacity-70'>{new Date(message.created_at).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedThread.status === 'open' && (
                            <form onSubmit={handleSendMessage} className='border-t bg-card p-4'>
                                <div className='flex gap-2'>
                                    <input
                                        type='text'
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder='Type your message...'
                                        className='flex-1 rounded-md border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/10'
                                    />
                                    <button type='submit' className='rounded-md bg-primary/10 px-4 py-2 text-foreground transition-colors hover:bg-primary/20'>
                                        <Send className='h-5 w-5' />
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                ) : (
                    <div className='flex flex-1 flex-col items-center justify-center text-muted-foreground'>
                        <MessageSquare className='mb-4 h-12 w-12' />
                        <p className='text-lg'>Select a thread to view messages</p>
                        <p className='mt-2 text-sm'>Choose a conversation from the list on the left</p>
                    </div>
                )}
            </div>
        </div>
    );
}
