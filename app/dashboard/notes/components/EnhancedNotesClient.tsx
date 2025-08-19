'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Users, History, Search, Settings, Plus, FileText, Clock, User, Calendar, Filter, Pin, Archive, ChevronLeft, ChevronRight, Folder, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isToday, isYesterday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface Note {
    id: string;
    title: string;
    content: string;
    note_type: 'daily' | 'general' | 'project' | 'meeting';
    note_date: string | null;
    tags: string[];
    is_pinned: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    user_id: string;
}

interface NoteEdit {
    id: string;
    content: string;
    user_name: string;
    user_email: string;
    timestamp: string;
    type: 'insert' | 'delete' | 'replace';
}

interface EnhancedNotesClientProps {
    initialNotes: Note[];
    currentUser: {
        email: string;
        name: string;
    };
}

const noteTypeConfig = {
    daily: { label: 'Daily', icon: Calendar, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300', emoji: '📅' },
    general: { label: 'General', icon: FileText, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', emoji: '📝' },
    project: { label: 'Project', icon: Folder, color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300', emoji: '📊' },
    meeting: { label: 'Meeting', icon: Users, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300', emoji: '🤝' },
};

export default function EnhancedNotesClient({ initialNotes, currentUser }: EnhancedNotesClientProps) {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [editHistory, setEditHistory] = useState<NoteEdit[]>([]);
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteType, setNewNoteType] = useState<'daily' | 'general' | 'project' | 'meeting'>('general');

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save functionality
    useEffect(() => {
        if (currentNote && content !== originalContent) {
            setHasChanges(true);

            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Set new timeout for auto-save
            saveTimeoutRef.current = setTimeout(() => {
                saveContent();
            }, 2000);
        }
    }, [content, originalContent, currentNote]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const saveContent = async () => {
        if (!currentNote || !hasChanges) return;

        setIsAutoSaving(true);
        try {
            const response = await fetch(`/api/notes/${currentNote.id}`, {
                method: 'PATCH',
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
                setOriginalContent(content);

                // Update the note in the list
                setNotes((prev) => prev.map((note) => (note.id === currentNote.id ? { ...note, content, updated_at: result.updated_at } : note)));

                // Update current note
                setCurrentNote((prev) => (prev ? { ...prev, content, updated_at: result.updated_at } : null));
            }
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsAutoSaving(false);
        }
    };

    const createNewNote = async () => {
        if (!newNoteTitle.trim()) return;

        try {
            const noteData = {
                title: newNoteTitle.trim(),
                content: '',
                note_type: newNoteType,
                note_date: newNoteType === 'daily' ? new Date().toISOString().split('T')[0] : null,
                tags: [],
                is_pinned: false,
            };

            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData),
            });

            if (response.ok) {
                const newNote = await response.json();
                setNotes((prev) => [newNote, ...prev]);
                openNote(newNote);
                setIsCreatingNote(false);
                setNewNoteTitle('');
                setNewNoteType('general');
            }
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const getTodaysDailyNote = async () => {
        const today = new Date().toISOString().split('T')[0];
        const existingDaily = notes.find((note) => note.note_type === 'daily' && note.note_date === today);

        if (existingDaily) {
            openNote(existingDaily);
            return;
        }

        // Create today's daily note
        try {
            const response = await fetch('/api/notes/daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: today }),
            });

            if (response.ok) {
                const dailyNote = await response.json();
                setNotes((prev) => [dailyNote, ...prev]);
                openNote(dailyNote);
            }
        } catch (error) {
            console.error('Failed to create daily note:', error);
        }
    };

    const openNote = (note: Note) => {
        // Save current note if there are changes
        if (currentNote && hasChanges) {
            saveContent();
        }

        setCurrentNote(note);
        setContent(note.content);
        setOriginalContent(note.content);
        setHasChanges(false);
        setLastSaved(null);

        // Focus textarea
        setTimeout(() => textareaRef.current?.focus(), 100);
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
    ];

    // Filter and sort notes
    const filteredNotes = notes
        .filter((note) => {
            if (note.is_archived) return false;

            const matchesSearch =
                !searchTerm ||
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesType = filterType === 'all' || note.note_type === filterType;

            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            // Pinned notes first
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;

            // Then by updated date
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

    const formatNoteDate = (note: Note) => {
        if (note.note_date) {
            const date = parseISO(note.note_date);
            if (isToday(date)) return 'Today';
            if (isYesterday(date)) return 'Yesterday';
            return format(date, 'MMM d, yyyy');
        }
        return format(parseISO(note.updated_at), 'MMM d, yyyy');
    };

    const getNotePreview = (note: Note) => {
        return note.content.replace(/#+\s/g, '').substring(0, 100).trim() || 'No content';
    };

    return (
        <div className='flex h-full'>
            {/* Sidebar */}
            {showSidebar && (
                <div className='flex w-80 flex-col border-r bg-secondary/10'>
                    {/* Sidebar Header */}
                    <div className='border-b p-4'>
                        <div className='mb-4 flex items-center justify-between'>
                            <h2 className='flex items-center gap-2 font-semibold'>
                                <FileText className='h-4 w-4' />
                                Notes
                            </h2>
                            <Button variant='ghost' size='sm' onClick={() => setShowSidebar(false)}>
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                        </div>

                        {/* Quick Actions */}
                        <div className='mb-4 flex gap-2'>
                            <Button onClick={getTodaysDailyNote} variant='outline' size='sm' className='flex-1'>
                                <Calendar className='mr-1 h-3 w-3' />
                                Today
                            </Button>
                            <Button onClick={() => setIsCreatingNote(true)} variant='outline' size='sm' className='flex-1'>
                                <Plus className='mr-1 h-3 w-3' />
                                New
                            </Button>
                        </div>

                        {/* Search */}
                        <div className='relative mb-3'>
                            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                            <Input placeholder='Search notes...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pl-9' />
                        </div>

                        {/* Filter */}
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger>
                                <SelectValue placeholder='Filter by type' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Notes</SelectItem>
                                <SelectItem value='daily'>📅 Daily</SelectItem>
                                <SelectItem value='project'>📊 Project</SelectItem>
                                <SelectItem value='meeting'>🤝 Meeting</SelectItem>
                                <SelectItem value='general'>📝 General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes List */}
                    <div className='flex-1 overflow-y-auto p-2'>
                        {isCreatingNote && (
                            <div className='mb-2 rounded-lg border bg-card p-3'>
                                <Input
                                    placeholder='Note title...'
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    className='mb-2'
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            createNewNote();
                                        } else if (e.key === 'Escape') {
                                            setIsCreatingNote(false);
                                            setNewNoteTitle('');
                                        }
                                    }}
                                />
                                <div className='flex gap-2'>
                                    <Select value={newNoteType} onValueChange={(value: any) => setNewNoteType(value)}>
                                        <SelectTrigger className='flex-1'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='general'>📝 General</SelectItem>
                                            <SelectItem value='daily'>📅 Daily</SelectItem>
                                            <SelectItem value='project'>📊 Project</SelectItem>
                                            <SelectItem value='meeting'>🤝 Meeting</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={createNewNote} size='sm'>
                                        Create
                                    </Button>
                                </div>
                            </div>
                        )}

                        {filteredNotes.map((note) => {
                            const config = noteTypeConfig[note.note_type];
                            const isActive = currentNote?.id === note.id;

                            return (
                                <div
                                    key={note.id}
                                    onClick={() => openNote(note)}
                                    className={`mb-2 cursor-pointer rounded-lg border p-3 transition-colors ${
                                        isActive ? 'border-primary bg-primary/10' : 'bg-card hover:bg-secondary/50'
                                    }`}>
                                    <div className='mb-2 flex items-start justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm'>{config.emoji}</span>
                                            <h3 className='flex-1 truncate text-sm font-medium'>{note.title}</h3>
                                            {note.is_pinned && <Pin className='h-3 w-3 text-primary' />}
                                        </div>
                                    </div>

                                    <p className='mb-2 line-clamp-2 text-xs text-muted-foreground'>{getNotePreview(note)}</p>

                                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                                        <span>{formatNoteDate(note)}</span>
                                        <Badge variant='outline' className={`text-xs ${config.color}`}>
                                            {config.label}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredNotes.length === 0 && (
                            <div className='py-8 text-center text-muted-foreground'>
                                <FileText className='mx-auto mb-2 h-8 w-8 opacity-50' />
                                <p className='text-sm'>No notes found</p>
                                <Button onClick={() => setIsCreatingNote(true)} variant='ghost' size='sm' className='mt-2'>
                                    Create your first note
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Editor */}
            <div className='flex flex-1 flex-col'>
                {/* Header */}
                <div className='border-b bg-background/95 px-6 py-4 backdrop-blur-sm'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            {!showSidebar && (
                                <Button variant='ghost' size='sm' onClick={() => setShowSidebar(true)}>
                                    <ChevronRight className='h-4 w-4' />
                                </Button>
                            )}

                            <div className='flex items-center gap-2'>
                                {currentNote ? (
                                    <>
                                        <span className='text-lg'>{noteTypeConfig[currentNote.note_type].emoji}</span>
                                        <h1 className='text-xl font-semibold'>{currentNote.title}</h1>
                                        {currentNote.is_pinned && <Pin className='h-4 w-4 text-primary' />}
                                    </>
                                ) : (
                                    <h1 className='text-xl font-semibold'>Select a note to start writing</h1>
                                )}
                            </div>
                        </div>

                        <div className='flex items-center gap-3'>
                            {/* Status indicators */}
                            {currentNote && (
                                <>
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

                                    <Button onClick={saveContent} disabled={!hasChanges || isAutoSaving} size='sm'>
                                        <Save className='h-4 w-4' />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Templates bar */}
                    {currentNote && (
                        <div className='mt-4 flex gap-2 overflow-x-auto pb-2'>
                            {templates.map((template) => (
                                <Button key={template.name} variant='outline' size='sm' onClick={() => insertTemplate(template.content)} className='whitespace-nowrap'>
                                    <Plus className='mr-1 h-3 w-3' />
                                    {template.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Editor */}
                <div className='relative flex-1'>
                    {currentNote ? (
                        <>
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={handleContentChange}
                                onKeyDown={handleKeyDown}
                                placeholder='Start writing...'
                                className='h-full w-full resize-none border-none bg-transparent p-6 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground'
                                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}
                            />

                            {/* Word count */}
                            <div className='absolute bottom-4 right-4 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground'>
                                {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
                            </div>
                        </>
                    ) : (
                        <div className='flex h-full items-center justify-center text-muted-foreground'>
                            <div className='text-center'>
                                <FileText className='mx-auto mb-4 h-12 w-12 opacity-50' />
                                <h3 className='mb-2 text-lg font-medium'>No note selected</h3>
                                <p className='mb-4 text-sm'>Choose a note from the sidebar or create a new one</p>
                                <div className='flex justify-center gap-2'>
                                    <Button onClick={getTodaysDailyNote} variant='outline'>
                                        <Calendar className='mr-2 h-4 w-4' />
                                        Today's Note
                                    </Button>
                                    <Button onClick={() => setIsCreatingNote(true)}>
                                        <Plus className='mr-2 h-4 w-4' />
                                        New Note
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
