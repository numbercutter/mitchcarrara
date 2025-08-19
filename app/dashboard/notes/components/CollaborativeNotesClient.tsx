'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Users, History, Search, Settings, Plus, FileText, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface NoteEdit {
    id: string;
    content: string;
    position: number;
    length: number;
    user_name: string;
    user_email: string;
    timestamp: string;
    type: 'insert' | 'delete' | 'replace';
}

interface NotesClientProps {
    initialContent: string;
    currentUser: {
        email: string;
        name: string;
    };
}

export default function CollaborativeNotesClient({ initialContent, currentUser }: NotesClientProps) {
    const [content, setContent] = useState(initialContent);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [editHistory, setEditHistory] = useState<NoteEdit[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastContentRef = useRef(initialContent);

    // Auto-save functionality
    useEffect(() => {
        if (content !== lastContentRef.current) {
            setHasChanges(true);

            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Set new timeout for auto-save
            saveTimeoutRef.current = setTimeout(() => {
                saveContent();
            }, 2000); // Auto-save after 2 seconds of inactivity
        }
    }, [content]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const saveContent = async () => {
        if (!hasChanges) return;

        setIsAutoSaving(true);
        try {
            const response = await fetch('/api/notes/collaborative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    user_name: currentUser.name,
                    user_email: currentUser.email,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setLastSaved(new Date());
                setHasChanges(false);
                lastContentRef.current = content;

                // Add to edit history
                if (result.edit) {
                    setEditHistory((prev) => [result.edit, ...prev.slice(0, 49)]); // Keep last 50 edits
                }
            }
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsAutoSaving(false);
        }
    };

    const fetchEditHistory = async () => {
        try {
            const response = await fetch('/api/notes/collaborative/history');
            if (response.ok) {
                const history = await response.json();
                setEditHistory(history);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Cmd/Ctrl + S to save
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            saveContent();
        }

        // Tab support
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newContent = content.substring(0, start) + '    ' + content.substring(end);
            setContent(newContent);

            // Restore cursor position
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                }
            }, 0);
        }
    };

    const insertTemplate = (template: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + template + content.substring(end);
        setContent(newContent);

        // Focus and position cursor after template
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + template.length;
        }, 0);
    };

    const templates = [
        {
            name: 'Meeting Notes',
            content: `# Meeting Notes - ${new Date().toLocaleDateString()}\n\n## Attendees\n- \n\n## Agenda\n- \n\n## Notes\n\n\n## Action Items\n- [ ] \n\n## Next Steps\n\n`,
        },
        { name: 'Daily Standup', content: `# Daily Standup - ${new Date().toLocaleDateString()}\n\n## Yesterday\n- \n\n## Today\n- \n\n## Blockers\n- \n\n` },
        { name: 'Project Planning', content: `# Project: \n\n## Overview\n\n\n## Goals\n- [ ] \n\n## Timeline\n\n\n## Resources Needed\n\n\n## Risks & Mitigation\n\n` },
        {
            name: 'Task List',
            content: `# Tasks - ${new Date().toLocaleDateString()}\n\n## High Priority\n- [ ] \n\n## Medium Priority\n- [ ] \n\n## Low Priority\n- [ ] \n\n## Completed\n- [x] \n\n`,
        },
    ];

    const highlightSearchTerm = (text: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const getUserDisplayName = (email: string, name?: string) => {
        if (name) return name;
        return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    };

    return (
        <div className='flex h-full flex-col'>
            {/* Header */}
            <div className='border-b bg-background/95 px-6 py-4 backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2'>
                            <FileText className='h-5 w-5 text-primary' />
                            <h1 className='text-xl font-semibold'>Collaborative Notes</h1>
                        </div>

                        {/* Status indicators */}
                        <div className='flex items-center gap-3'>
                            {isAutoSaving && (
                                <Badge variant='outline' className='gap-1'>
                                    <div className='h-2 w-2 animate-pulse rounded-full bg-blue-500' />
                                    Saving...
                                </Badge>
                            )}

                            {lastSaved && !hasChanges && (
                                <Badge variant='outline' className='gap-1'>
                                    <Save className='h-3 w-3' />
                                    Saved {lastSaved.toLocaleTimeString()}
                                </Badge>
                            )}

                            {hasChanges && (
                                <Badge variant='outline' className='gap-1'>
                                    <div className='h-2 w-2 rounded-full bg-orange-500' />
                                    Unsaved changes
                                </Badge>
                            )}

                            {collaborators.length > 0 && (
                                <Badge variant='outline' className='gap-1'>
                                    <Users className='h-3 w-3' />
                                    {collaborators.length} online
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        {/* Search */}
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                            <Input placeholder='Search in notes...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-64 pl-9' />
                        </div>

                        {/* History toggle */}
                        <Button
                            variant={showHistory ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => {
                                setShowHistory(!showHistory);
                                if (!showHistory) fetchEditHistory();
                            }}>
                            <History className='h-4 w-4' />
                        </Button>

                        {/* Manual save */}
                        <Button onClick={saveContent} disabled={!hasChanges || isAutoSaving}>
                            <Save className='h-4 w-4' />
                        </Button>
                    </div>
                </div>

                {/* Templates bar */}
                <div className='mt-4 flex gap-2 overflow-x-auto pb-2'>
                    {templates.map((template) => (
                        <Button key={template.name} variant='outline' size='sm' onClick={() => insertTemplate(template.content)} className='whitespace-nowrap'>
                            <Plus className='mr-1 h-3 w-3' />
                            {template.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Main content area */}
            <div className='flex flex-1 overflow-hidden'>
                {/* Notes editor */}
                <div className='flex flex-1 flex-col'>
                    <div className='relative flex-1'>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            onKeyDown={handleKeyDown}
                            placeholder='Start typing your notes here...

You can use:
• **bold text** or *italic text*
• # Headers
• - Bullet points
• [ ] Task lists
• Tab for indentation

Tip: Press Cmd/Ctrl + S to save manually'
                            className='h-full w-full resize-none border-none bg-transparent p-6 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground'
                            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}
                        />

                        {/* Word count */}
                        <div className='absolute bottom-4 right-4 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground'>
                            {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
                        </div>
                    </div>
                </div>

                {/* Edit history sidebar */}
                {showHistory && (
                    <div className='flex w-80 flex-col border-l bg-secondary/20'>
                        <div className='border-b px-4 py-3'>
                            <h3 className='flex items-center gap-2 font-semibold'>
                                <History className='h-4 w-4' />
                                Edit History
                            </h3>
                        </div>

                        <div className='flex-1 space-y-3 overflow-y-auto p-4'>
                            {editHistory.length > 0 ? (
                                editHistory.map((edit) => (
                                    <div key={edit.id} className='rounded-lg border bg-card p-3'>
                                        <div className='mb-2 flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <User className='h-3 w-3' />
                                                <span className='text-sm font-medium'>{getUserDisplayName(edit.user_email, edit.user_name)}</span>
                                            </div>
                                            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                                                <Clock className='h-3 w-3' />
                                                {formatTimestamp(edit.timestamp)}
                                            </span>
                                        </div>

                                        <div className='mb-1 text-xs text-muted-foreground'>
                                            {edit.type === 'insert' && '+ Added text'}
                                            {edit.type === 'delete' && '- Removed text'}
                                            {edit.type === 'replace' && '~ Modified text'}
                                        </div>

                                        <div className='overflow-hidden text-ellipsis rounded bg-secondary/50 p-2 text-sm'>
                                            {edit.content.substring(0, 100)}
                                            {edit.content.length > 100 && '...'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='py-8 text-center text-muted-foreground'>
                                    <History className='mx-auto mb-2 h-8 w-8 opacity-50' />
                                    <p className='text-sm'>No edit history yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
