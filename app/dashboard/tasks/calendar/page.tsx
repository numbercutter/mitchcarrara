'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, MoreHorizontal } from 'lucide-react';

interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    start: string;
    end: string;
    type: 'task' | 'meeting' | 'deadline' | 'reminder';
    assignee: 'me' | 'assistant' | 'both';
    priority: 'low' | 'medium' | 'high';
    location?: string;
}

const eventTypes = {
    'task': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', icon: '📋' },
    'meeting': { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: '👥' },
    'deadline': { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', icon: '⚠️' },
    'reminder': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', icon: '🔔' }
};

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [showEventForm, setShowEventForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    
    const [events, setEvents] = useState<CalendarEvent[]>([
        {
            id: '1',
            title: 'Investor Call - Series A',
            description: 'Discussion with Sequoia Capital about Series A funding',
            start: '2024-01-15T10:00:00',
            end: '2024-01-15T11:00:00',
            type: 'meeting',
            assignee: 'both',
            priority: 'high',
            location: 'Zoom'
        },
        {
            id: '2',
            title: 'Q1 Financial Report Due',
            description: 'Complete and submit quarterly financial reports',
            start: '2024-01-20T17:00:00',
            end: '2024-01-20T17:00:00',
            type: 'deadline',
            assignee: 'assistant',
            priority: 'high'
        },
        {
            id: '3',
            title: 'Team Performance Reviews',
            description: 'Schedule and conduct annual performance reviews',
            start: '2024-01-18T14:00:00',
            end: '2024-01-18T17:00:00',
            type: 'task',
            assignee: 'me',
            priority: 'medium'
        },
        {
            id: '4',
            title: 'Product Demo Prep',
            description: 'Prepare demo for upcoming investor meetings',
            start: '2024-01-16T09:00:00',
            end: '2024-01-16T12:00:00',
            type: 'task',
            assignee: 'both',
            priority: 'high'
        },
        {
            id: '5',
            title: 'Board Meeting Reminder',
            description: 'Monthly board meeting preparation deadline',
            start: '2024-01-22T09:00:00',
            end: '2024-01-22T09:00:00',
            type: 'reminder',
            assignee: 'assistant',
            priority: 'medium'
        }
    ]);

    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        type: 'task' as CalendarEvent['type'],
        assignee: 'both' as CalendarEvent['assignee'],
        priority: 'medium' as CalendarEvent['priority'],
        location: ''
    });

    // Calendar logic
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => event.start.split('T')[0] === dateStr);
    };

    const addEvent = () => {
        if (!newEvent.title.trim() || !newEvent.start) return;

        const event: CalendarEvent = {
            id: Date.now().toString(),
            ...newEvent,
            end: newEvent.end || newEvent.start
        };

        setEvents([...events, event]);
        setNewEvent({
            title: '',
            description: '',
            start: '',
            end: '',
            type: 'task',
            assignee: 'both',
            priority: 'medium',
            location: ''
        });
        setShowEventForm(false);
    };

    const formatTime = (datetime: string) => {
        return new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className='h-24 p-1'></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            days.push(
                <div
                    key={day}
                    className={`h-24 p-1 border-b border-r border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors ${
                        isToday ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => {
                        setSelectedDate(date);
                        setNewEvent({...newEvent, start: date.toISOString().split('T')[0] + 'T09:00'});
                        setShowEventForm(true);
                    }}>
                    <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                        {day}
                    </div>
                    <div className='space-y-1 mt-1'>
                        {dayEvents.slice(0, 2).map(event => (
                            <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate ${eventTypes[event.type].color}`}>
                                <span className='mr-1'>{eventTypes[event.type].icon}</span>
                                {event.title}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className='text-xs text-muted-foreground'>
                                +{dayEvents.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Task Calendar</h1>
                    <p className='mt-2 text-muted-foreground'>Schedule and coordinate tasks with your assistant.</p>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='flex rounded-lg border'>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1 text-sm ${viewMode === 'day' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                            Day
                        </button>
                    </div>
                    <button
                        onClick={() => setShowEventForm(true)}
                        className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                        <Plus className='h-4 w-4' />
                        Add Event
                    </button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <button
                        onClick={() => navigateMonth('prev')}
                        className='rounded-full p-2 hover:bg-secondary'>
                        <ChevronLeft className='h-5 w-5' />
                    </button>
                    <h2 className='text-xl font-semibold'>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                        onClick={() => navigateMonth('next')}
                        className='rounded-full p-2 hover:bg-secondary'>
                        <ChevronRight className='h-5 w-5' />
                    </button>
                </div>
                <button
                    onClick={() => setCurrentDate(new Date())}
                    className='rounded-md border px-3 py-1 text-sm hover:bg-secondary'>
                    Today
                </button>
            </div>

            {/* New Event Form */}
            {showEventForm && (
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold'>Create New Event</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium mb-1'>Title</label>
                            <input
                                type='text'
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='Event title...'
                            />
                        </div>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium mb-1'>Description</label>
                            <textarea
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                className='w-full resize-none rounded border bg-background px-3 py-2 text-sm'
                                rows={2}
                                placeholder='Event description...'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Start Date/Time</label>
                            <input
                                type='datetime-local'
                                value={newEvent.start}
                                onChange={(e) => setNewEvent({...newEvent, start: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>End Date/Time</label>
                            <input
                                type='datetime-local'
                                value={newEvent.end}
                                onChange={(e) => setNewEvent({...newEvent, end: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Type</label>
                            <select
                                value={newEvent.type}
                                onChange={(e) => setNewEvent({...newEvent, type: e.target.value as CalendarEvent['type']})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value='task'>Task</option>
                                <option value='meeting'>Meeting</option>
                                <option value='deadline'>Deadline</option>
                                <option value='reminder'>Reminder</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Assignee</label>
                            <select
                                value={newEvent.assignee}
                                onChange={(e) => setNewEvent({...newEvent, assignee: e.target.value as CalendarEvent['assignee']})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value='both'>Both</option>
                                <option value='me'>Me</option>
                                <option value='assistant'>Assistant</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Priority</label>
                            <select
                                value={newEvent.priority}
                                onChange={(e) => setNewEvent({...newEvent, priority: e.target.value as CalendarEvent['priority']})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value='low'>Low</option>
                                <option value='medium'>Medium</option>
                                <option value='high'>High</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Location (optional)</label>
                            <input
                                type='text'
                                value={newEvent.location}
                                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='Meeting location or link...'
                            />
                        </div>
                    </div>
                    <div className='flex justify-end gap-2 mt-4'>
                        <button
                            onClick={() => setShowEventForm(false)}
                            className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'>
                            Cancel
                        </button>
                        <button
                            onClick={addEvent}
                            className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                            Create Event
                        </button>
                    </div>
                </div>
            )}

            {/* Calendar Grid */}
            <div className='rounded-lg border bg-card overflow-hidden'>
                {/* Day Headers */}
                <div className='grid grid-cols-7 border-b'>
                    {dayNames.map(day => (
                        <div key={day} className='p-3 text-center text-sm font-medium border-r border-border/50 last:border-r-0'>
                            {day}
                        </div>
                    ))}
                </div>
                {/* Calendar Days */}
                <div className='grid grid-cols-7'>
                    {renderCalendar()}
                </div>
            </div>

            {/* Upcoming Events */}
            <div className='rounded-lg border bg-card p-6'>
                <h3 className='mb-4 font-semibold'>Upcoming Events</h3>
                <div className='space-y-3'>
                    {events
                        .filter(event => new Date(event.start) >= new Date())
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .slice(0, 5)
                        .map(event => (
                            <div key={event.id} className='flex items-center justify-between p-3 rounded-lg bg-secondary/30'>
                                <div className='flex items-center gap-3'>
                                    <span className='text-lg'>{eventTypes[event.type].icon}</span>
                                    <div>
                                        <h4 className='font-medium text-sm'>{event.title}</h4>
                                        <div className='flex items-center gap-3 text-xs text-muted-foreground mt-1'>
                                            <span className='flex items-center gap-1'>
                                                <Clock className='h-3 w-3' />
                                                {formatTime(event.start)}
                                                {event.start !== event.end && ` - ${formatTime(event.end)}`}
                                            </span>
                                            <span className='flex items-center gap-1'>
                                                <User className='h-3 w-3' />
                                                {event.assignee === 'both' ? 'Both' : event.assignee === 'me' ? 'Me' : 'Assistant'}
                                            </span>
                                            {event.location && (
                                                <span className='flex items-center gap-1'>
                                                    <MapPin className='h-3 w-3' />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                    <MoreHorizontal className='h-4 w-4' />
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}