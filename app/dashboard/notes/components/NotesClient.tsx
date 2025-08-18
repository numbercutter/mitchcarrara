'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Search, Filter, Pin, Archive, Edit3, Save, X, StickyNote, BookOpen, FileText, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type Note = {
    id: string;
    title: string;
    content: string;
    note_type: 'daily' | 'general' | 'project' | 'meeting';
    note_date: string | null;
    tags: string[];
    is_pinned: boolean;
    is_archived: boolean;
    metadata: any;
    created_at: string;
    updated_at: string;
};

type NotesClientProps = {
    initialNotes: Note[];
    todayNote: Note | null;
};

export default function NotesClient({ initialNotes, todayNote }: NotesClientProps) {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [dailyNote, setDailyNote] = useState<Note | null>(todayNote);
    const [isCreating, setIsCreating] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Form states for creating/editing notes
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        note_type: 'general' as 'daily' | 'general' | 'project' | 'meeting',
        note_date: '',
        tags: [] as string[],
        is_pinned: false,
    });

    // Get unique tags from all notes
    const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)));

    // Filter notes based on search and filters
    const filteredNotes = notes.filter((note) => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' || note.note_type === filterType;

        const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => note.tags.includes(tag));

        return matchesSearch && matchesType && matchesTags;
    });

    // Sort notes (pinned first, then by updated date)
    const sortedNotes = filteredNotes.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    // Create or get today's daily note
    const handleDailyNote = async () => {
        if (dailyNote) {
            setEditingNote(dailyNote);
            setFormData({
                title: dailyNote.title,
                content: dailyNote.content,
                note_type: dailyNote.note_type,
                note_date: dailyNote.note_date || '',
                tags: dailyNote.tags,
                is_pinned: dailyNote.is_pinned,
            });
            return;
        }

        try {
            const response = await fetch('/api/notes/daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            if (response.ok) {
                const newDailyNote = await response.json();
                setDailyNote(newDailyNote);
                setNotes((prev) => [newDailyNote, ...prev]);
                setEditingNote(newDailyNote);
                setFormData({
                    title: newDailyNote.title,
                    content: newDailyNote.content,
                    note_type: newDailyNote.note_type,
                    note_date: newDailyNote.note_date || '',
                    tags: newDailyNote.tags,
                    is_pinned: newDailyNote.is_pinned,
                });
            }
        } catch (error) {
            console.error('Error creating daily note:', error);
        }
    };

    // Create a new note
    const handleCreateNote = async () => {
        if (!formData.title.trim()) return;

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newNote = await response.json();
                setNotes((prev) => [newNote, ...prev]);
                setIsCreating(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error creating note:', error);
        }
    };

    // Update a note
    const handleUpdateNote = async (noteId: string) => {
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedNote = await response.json();
                setNotes((prev) => prev.map((note) => (note.id === noteId ? updatedNote : note)));

                // Update daily note if it's the one being edited
                if (dailyNote && dailyNote.id === noteId) {
                    setDailyNote(updatedNote);
                }

                setEditingNote(null);
                resetForm();
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    // Delete a note
    const handleDeleteNote = async (noteId: string) => {
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setNotes((prev) => prev.filter((note) => note.id !== noteId));

                // Clear daily note if it was deleted
                if (dailyNote && dailyNote.id === noteId) {
                    setDailyNote(null);
                }

                if (editingNote && editingNote.id === noteId) {
                    setEditingNote(null);
                    resetForm();
                }
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    // Toggle pin status
    const handleTogglePin = async (note: Note) => {
        try {
            const response = await fetch(`/api/notes/${note.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_pinned: !note.is_pinned }),
            });

            if (response.ok) {
                const updatedNote = await response.json();
                setNotes((prev) => prev.map((n) => (n.id === note.id ? updatedNote : n)));
            }
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            note_type: 'general',
            note_date: '',
            tags: [],
            is_pinned: false,
        });
    };

    // Start editing a note
    const startEditing = (note: Note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            note_type: note.note_type,
            note_date: note.note_date || '',
            tags: note.tags,
            is_pinned: note.is_pinned,
        });
    };

    // Add a tag
    const addTag = (tag: string) => {
        if (tag && !formData.tags.includes(tag)) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, tag],
            }));
        }
    };

    // Remove a tag
    const removeTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const getNoteTypeIcon = (type: string) => {
        switch (type) {
            case 'daily':
                return <Calendar className='h-4 w-4' />;
            case 'project':
                return <FileText className='h-4 w-4' />;
            case 'meeting':
                return <Users className='h-4 w-4' />;
            default:
                return <StickyNote className='h-4 w-4' />;
        }
    };

    const getNoteTypeColor = (type: string) => {
        switch (type) {
            case 'daily':
                return 'bg-blue-100 text-blue-800';
            case 'project':
                return 'bg-green-100 text-green-800';
            case 'meeting':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className='mx-auto max-w-7xl space-y-4 lg:space-y-6'>
            {/* Header */}
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                <div>
                    <h1 className='text-2xl font-bold lg:text-3xl'>Notes</h1>
                    <p className='text-sm text-muted-foreground lg:text-base'>Your personal note-taking space</p>
                </div>
                <div className='flex gap-2'>
                    <Button onClick={handleDailyNote} variant='outline' size='sm' className='flex-1 lg:flex-none'>
                        <Calendar className='mr-2 h-4 w-4' />
                        <span className='hidden sm:inline'>{dailyNote ? "Open Today's Note" : 'Create Daily Note'}</span>
                        <span className='sm:hidden'>Daily</span>
                    </Button>
                    <Button onClick={() => setIsCreating(true)} size='sm' className='flex-1 lg:flex-none'>
                        <Plus className='mr-2 h-4 w-4' />
                        <span className='hidden sm:inline'>New Note</span>
                        <span className='sm:hidden'>New</span>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4'>
                <Card>
                    <CardContent className='p-3 lg:p-4'>
                        <div className='flex items-center'>
                            <BookOpen className='h-6 w-6 text-blue-600 lg:h-8 lg:w-8' />
                            <div className='ml-3 lg:ml-4'>
                                <p className='text-xs font-medium text-muted-foreground lg:text-sm'>Total Notes</p>
                                <p className='text-lg font-bold lg:text-2xl'>{notes.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-3 lg:p-4'>
                        <div className='flex items-center'>
                            <Pin className='h-6 w-6 text-yellow-600 lg:h-8 lg:w-8' />
                            <div className='ml-3 lg:ml-4'>
                                <p className='text-xs font-medium text-muted-foreground lg:text-sm'>Pinned</p>
                                <p className='text-lg font-bold lg:text-2xl'>{notes.filter((n) => n.is_pinned).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-3 lg:p-4'>
                        <div className='flex items-center'>
                            <Calendar className='h-6 w-6 text-green-600 lg:h-8 lg:w-8' />
                            <div className='ml-3 lg:ml-4'>
                                <p className='text-xs font-medium text-muted-foreground lg:text-sm'>Daily Notes</p>
                                <p className='text-lg font-bold lg:text-2xl'>{notes.filter((n) => n.note_type === 'daily').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-3 lg:p-4'>
                        <div className='flex items-center'>
                            <FileText className='h-6 w-6 text-purple-600 lg:h-8 lg:w-8' />
                            <div className='ml-3 lg:ml-4'>
                                <p className='text-xs font-medium text-muted-foreground lg:text-sm'>Projects</p>
                                <p className='text-lg font-bold lg:text-2xl'>{notes.filter((n) => n.note_type === 'project').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Filter className='h-4 w-4' />
                        Search & Filter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='flex flex-col gap-4 sm:flex-row'>
                            <div className='flex-1'>
                                <Label className='text-sm'>Search Notes</Label>
                                <div className='relative mt-1'>
                                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                                    <Input placeholder='Search titles and content...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='h-10 pl-10' />
                                </div>
                            </div>
                            <div className='w-full sm:w-40'>
                                <Label className='text-sm'>Note Type</Label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className='mt-1 h-10'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='all'>All Types</SelectItem>
                                        <SelectItem value='daily'>Daily</SelectItem>
                                        <SelectItem value='general'>General</SelectItem>
                                        <SelectItem value='project'>Project</SelectItem>
                                        <SelectItem value='meeting'>Meeting</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    {allTags.length > 0 && (
                        <div className='mt-4'>
                            <Label>Filter by Tags</Label>
                            <div className='mt-2 flex flex-wrap gap-2'>
                                {allTags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                                        className='cursor-pointer'
                                        onClick={() => {
                                            if (selectedTags.includes(tag)) {
                                                setSelectedTags((prev) => prev.filter((t) => t !== tag));
                                            } else {
                                                setSelectedTags((prev) => [...prev, tag]);
                                            }
                                        }}>
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Note Form */}
            {(isCreating || editingNote) && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</CardTitle>
                        <CardDescription>{editingNote ? 'Make changes to your note' : 'Add a new note to your collection'}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <Label>Title</Label>
                            <Input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder='Enter note title...' />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label>Note Type</Label>
                                <Select value={formData.note_type} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, note_type: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='general'>General</SelectItem>
                                        <SelectItem value='daily'>Daily</SelectItem>
                                        <SelectItem value='project'>Project</SelectItem>
                                        <SelectItem value='meeting'>Meeting</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.note_type === 'daily' && (
                                <div>
                                    <Label>Date</Label>
                                    <Input type='date' value={formData.note_date} onChange={(e) => setFormData((prev) => ({ ...prev, note_date: e.target.value }))} />
                                </div>
                            )}
                        </div>

                        <div>
                            <Label>Content</Label>
                            <Textarea
                                value={formData.content}
                                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                                placeholder='Write your note content here...'
                                rows={10}
                                className='min-h-64'
                            />
                        </div>

                        <div>
                            <Label>Tags</Label>
                            <div className='mt-2 flex flex-wrap gap-2'>
                                {formData.tags.map((tag) => (
                                    <Badge key={tag} variant='secondary' className='cursor-pointer'>
                                        {tag}
                                        <X className='ml-1 h-3 w-3' onClick={() => removeTag(tag)} />
                                    </Badge>
                                ))}
                                <Input
                                    placeholder='Add tag and press Enter...'
                                    className='w-48'
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addTag(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className='flex items-center justify-between'>
                            <label className='flex items-center space-x-2'>
                                <input
                                    type='checkbox'
                                    checked={formData.is_pinned}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, is_pinned: e.target.checked }))}
                                    className='rounded'
                                />
                                <span className='text-sm'>Pin this note</span>
                            </label>

                            <div className='flex gap-2'>
                                <Button
                                    variant='outline'
                                    onClick={() => {
                                        setIsCreating(false);
                                        setEditingNote(null);
                                        resetForm();
                                    }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => (editingNote ? handleUpdateNote(editingNote.id) : handleCreateNote())} disabled={!formData.title.trim()}>
                                    <Save className='mr-2 h-4 w-4' />
                                    {editingNote ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes List */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {sortedNotes.map((note) => (
                    <Card key={note.id} className='relative'>
                        {note.is_pinned && <Pin className='absolute right-2 top-2 h-4 w-4 fill-yellow-100 text-yellow-600' />}
                        <CardHeader className='pb-2'>
                            <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                    <CardTitle className='line-clamp-1 text-base'>{note.title}</CardTitle>
                                    <div className='mt-1 flex items-center gap-2'>
                                        <Badge variant='outline' className={`text-xs ${getNoteTypeColor(note.note_type)}`}>
                                            {getNoteTypeIcon(note.note_type)}
                                            <span className='ml-1'>{note.note_type}</span>
                                        </Badge>
                                        {note.note_date && (
                                            <Badge variant='outline' className='text-xs'>
                                                {format(parseISO(note.note_date), 'MMM d, yyyy')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className='mb-3 line-clamp-3 text-sm text-muted-foreground'>{note.content || 'No content yet...'}</p>

                            {note.tags.length > 0 && (
                                <div className='mb-3 flex flex-wrap gap-1'>
                                    {note.tags.slice(0, 3).map((tag) => (
                                        <Badge key={tag} variant='secondary' className='text-xs'>
                                            {tag}
                                        </Badge>
                                    ))}
                                    {note.tags.length > 3 && (
                                        <Badge variant='secondary' className='text-xs'>
                                            +{note.tags.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <div className='flex items-center justify-between text-xs text-muted-foreground'>
                                <span>Updated {format(parseISO(note.updated_at), 'MMM d, h:mm a')}</span>
                                <div className='flex gap-1'>
                                    <Button size='sm' variant='ghost' onClick={() => handleTogglePin(note)} className='h-8 w-8 p-0'>
                                        <Pin className={`h-3 w-3 ${note.is_pinned ? 'fill-yellow-600 text-yellow-600' : ''}`} />
                                    </Button>
                                    <Button size='sm' variant='ghost' onClick={() => startEditing(note)} className='h-8 w-8 p-0'>
                                        <Edit3 className='h-3 w-3' />
                                    </Button>
                                    <Button size='sm' variant='ghost' onClick={() => handleDeleteNote(note.id)} className='h-8 w-8 p-0 text-red-600 hover:text-red-700'>
                                        <X className='h-3 w-3' />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {sortedNotes.length === 0 && (
                <Card>
                    <CardContent className='py-12 text-center'>
                        <StickyNote className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                        <h3 className='mb-2 text-lg font-medium'>No notes found</h3>
                        <p className='mb-4 text-muted-foreground'>
                            {searchTerm || filterType !== 'all' || selectedTags.length > 0 ? 'Try adjusting your search or filters' : 'Create your first note to get started'}
                        </p>
                        {!searchTerm && filterType === 'all' && selectedTags.length === 0 && (
                            <div className='flex justify-center gap-2'>
                                <Button onClick={handleDailyNote} variant='outline'>
                                    <Calendar className='mr-2 h-4 w-4' />
                                    Start with Today's Note
                                </Button>
                                <Button onClick={() => setIsCreating(true)}>
                                    <Plus className='mr-2 h-4 w-4' />
                                    Create First Note
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
