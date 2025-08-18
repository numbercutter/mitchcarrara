'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Calendar, CheckSquare, Gift } from 'lucide-react';
import type { Tables } from '@/types/database';

type CalendarEvent = Tables<'calendar_events'>;
type Task = Tables<'tasks'>;
type Contact = {
    id: string;
    name: string;
    birthday: string | null;
    relationship: string | null;
};

interface CalendarClientProps {
    initialEvents: CalendarEvent[];
    initialTasks: Task[];
    initialContacts: Contact[];
}

const eventTypeColors = {
    meeting: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    task: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    deadline: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    reminder: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    birthday: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    'task-todo': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    'task-in-progress': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    'task-done': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
};

// Helper function to parse due dates as local dates to avoid timezone issues
const parseLocalDate = (dateString: string): Date => {
    // Split the date string and create a date in local timezone
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
};

export default function CalendarClient({ initialEvents, initialTasks, initialContacts }: CalendarClientProps) {
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        event_type: 'task',
        start_datetime: new Date().toISOString(),
        end_datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Default to 1 hour later
        location: '',
        assignee: 'me',
        priority: 'medium',
    });

    const resetForm = () => {
        setEventForm({
            title: '',
            description: '',
            event_type: 'task',
            start_datetime: new Date().toISOString(),
            end_datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Default to 1 hour later
            location: '',
            assignee: 'me',
            priority: 'medium',
        });
        setShowEventForm(false);
        setEditingEvent(null);
    };

    const editEvent = (event: CalendarEvent) => {
        setEditingEvent(event);
        setEventForm({
            title: event.title,
            description: event.description || '',
            event_type: event.event_type,
            start_datetime: event.start_datetime,
            end_datetime: event.end_datetime,
            location: event.location || '',
            assignee: event.assignee,
            priority: event.priority,
        });
        setShowEventForm(true);
    };

    const saveEvent = async () => {
        if (!eventForm.title.trim()) return;

        // Ensure end_datetime is after start_datetime
        if (new Date(eventForm.end_datetime) <= new Date(eventForm.start_datetime)) {
            alert('End date/time must be after start date/time');
            return;
        }

        try {
            const eventData = {
                title: eventForm.title,
                description: eventForm.description || null,
                event_type: eventForm.event_type,
                start_datetime: eventForm.start_datetime,
                end_datetime: eventForm.end_datetime,
                location: eventForm.location || null,
                assignee: eventForm.assignee,
                priority: eventForm.priority,
            };

            let response;
            if (editingEvent) {
                // Update existing event
                response = await fetch(`/api/calendar-events/${editingEvent.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData),
                });

                if (!response.ok) throw new Error('Failed to update event');

                const updatedEvent = await response.json();
                setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? updatedEvent : e)));
            } else {
                // Create new event
                response = await fetch('/api/calendar-events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData),
                });

                if (!response.ok) throw new Error('Failed to create event');

                const newEvent = await response.json();
                setEvents((prev) => [...prev, newEvent]);
            }

            resetForm();
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const response = await fetch(`/api/calendar-events/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete event');

            setEvents((prev) => prev.filter((e) => e.id !== id));
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    // Generate birthday events for the current year
    const generateBirthdayEvents = () => {
        return contacts
            .filter((contact) => contact.birthday)
            .map((contact) => {
                const birthdayDate = new Date(contact.birthday!);
                const thisYearBirthday = new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate());

                return {
                    id: `birthday-${contact.id}`,
                    type: 'birthday',
                    title: `🎂 ${contact.name}'s Birthday`,
                    description: `${contact.relationship ? `${contact.relationship} - ` : ''}Birthday celebration`,
                    date: thisYearBirthday,
                    contact: contact,
                    event_type: 'birthday',
                };
            });
    };

    // Filter events for current month
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthEvents = events.filter((event) => {
        const eventDate = new Date(event.start_datetime);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });

    // Filter birthday events for current month
    const birthdayEvents = generateBirthdayEvents().filter((birthday) => {
        return birthday.date.getMonth() === currentMonth && birthday.date.getFullYear() === currentYear;
    });

    // Filter tasks for current month based on due_date or created_at
    const monthTasks = tasks.filter((task) => {
        const taskDate = task.due_date ? parseLocalDate(task.due_date) : new Date(task.created_at);
        return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
    });

    // Group events by date
    const eventsByDate = monthEvents.reduce(
        (acc, event) => {
            const dateKey = new Date(event.start_datetime).toDateString();
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push({ ...event, type: 'event' });
            return acc;
        },
        {} as Record<string, any[]>
    );

    // Add birthday events to the same structure
    const eventsWithBirthdays = birthdayEvents.reduce((acc, birthday) => {
        const dateKey = birthday.date.toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(birthday);
        return acc;
    }, eventsByDate);

    // Group tasks by date and add to the same structure
    const itemsByDate = monthTasks.reduce((acc, task) => {
        const taskDate = task.due_date ? parseLocalDate(task.due_date) : new Date(task.created_at);
        const dateKey = taskDate.toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push({ ...task, type: 'task' });
        return acc;
    }, eventsWithBirthdays);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    // Get days for calendar grid
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayWeekday; i++) {
        calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateKey = date.toDateString();
        const dayItems = itemsByDate[dateKey] || [];
        calendarDays.push({ day, date, events: dayItems });
    }

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Calendar</h1>
                    <p className='text-muted-foreground'>Manage your schedule and events</p>
                </div>
                <button onClick={() => setShowEventForm(true)} className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                    <Plus className='h-4 w-4' />
                    Add Event
                </button>
            </div>

            {/* Calendar Navigation */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <button onClick={() => navigateMonth('prev')} className='rounded p-2 hover:bg-accent'>
                        <ChevronLeft className='h-4 w-4' />
                    </button>
                    <h2 className='text-xl font-semibold'>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => navigateMonth('next')} className='rounded p-2 hover:bg-accent'>
                        <ChevronRight className='h-4 w-4' />
                    </button>
                </div>

                <div className='flex gap-2'>
                    <button onClick={() => setCurrentDate(new Date())} className='rounded border px-3 py-1 text-sm hover:bg-accent'>
                        Today
                    </button>
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as any)}
                        className='rounded border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary'>
                        <option value='month'>Month</option>
                        <option value='week'>Week</option>
                        <option value='list'>List</option>
                    </select>
                </div>
            </div>

            {/* Calendar Content */}
            {viewMode === 'month' && (
                <div className='rounded-lg border bg-card'>
                    {/* Calendar Header */}
                    <div className='grid grid-cols-7 border-b'>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className='border-r p-4 text-center font-medium last:border-r-0'>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className='grid grid-cols-7'>
                        {calendarDays.map((dayData, index) => (
                            <div key={index} className='min-h-[120px] border-b border-r p-2 last:border-r-0'>
                                {dayData && (
                                    <>
                                        <div className='mb-2 flex items-center justify-between'>
                                            <span
                                                className={`text-sm ${
                                                    dayData.date.toDateString() === new Date().toDateString()
                                                        ? 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'
                                                        : ''
                                                }`}>
                                                {dayData.day}
                                            </span>
                                        </div>
                                        <div className='space-y-1'>
                                            {dayData.events.slice(0, 3).map((item) => {
                                                let typeColor;
                                                let title;
                                                let icon = null;

                                                if (item.type === 'event') {
                                                    typeColor = eventTypeColors[item.event_type as keyof typeof eventTypeColors] || eventTypeColors.task;
                                                    title = item.title;
                                                } else if (item.type === 'birthday') {
                                                    typeColor = eventTypeColors.birthday;
                                                    title = item.title;
                                                    icon = <Gift className='mr-1 inline h-3 w-3' />;
                                                } else {
                                                    // It's a task
                                                    const status = item.status || 'todo';
                                                    typeColor = eventTypeColors[`task-${status}` as keyof typeof eventTypeColors] || eventTypeColors['task-todo'];
                                                    title = item.title;
                                                    icon = <CheckSquare className='mr-1 inline h-3 w-3' />;
                                                }

                                                return (
                                                    <div
                                                        key={`${item.type}-${item.id}`}
                                                        className={`cursor-pointer truncate rounded p-1 text-xs hover:opacity-80 ${typeColor}`}
                                                        title={`${item.type === 'task' ? 'Task: ' : item.type === 'birthday' ? 'Birthday: ' : 'Event: '}${title}`}
                                                        onClick={() => (item.type === 'event' ? editEvent(item) : null)}>
                                                        {icon}
                                                        {title}
                                                    </div>
                                                );
                                            })}
                                            {dayData.events.length > 3 && <div className='text-xs text-muted-foreground'>+{dayData.events.length - 3} more</div>}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {viewMode === 'list' && (
                <div className='space-y-4'>
                    {monthEvents.length > 0 || monthTasks.length > 0 || birthdayEvents.length > 0 ? (
                        <>
                            {/* Birthday Events */}
                            {birthdayEvents.map((birthday) => (
                                <div key={birthday.id} className='rounded-lg border bg-card p-6 transition-shadow hover:shadow-md'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <div className='mb-2 flex items-center gap-3'>
                                                <span className={`rounded px-2 py-1 text-xs ${eventTypeColors.birthday}`}>Birthday</span>
                                                <h3 className='flex items-center gap-2 font-semibold'>
                                                    <Gift className='h-4 w-4' />
                                                    {birthday.title}
                                                </h3>
                                            </div>
                                            <p className='mb-3 text-muted-foreground'>{birthday.description}</p>
                                            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                                <div className='flex items-center gap-1'>
                                                    <Calendar className='h-4 w-4' />
                                                    {birthday.date.toLocaleDateString()}
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <User className='h-4 w-4' />
                                                    <span className='capitalize'>{birthday.contact.relationship || 'Contact'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Events */}
                            {monthEvents.map((event) => {
                                const typeColor = eventTypeColors[event.event_type as keyof typeof eventTypeColors] || eventTypeColors.task;
                                return (
                                    <div key={event.id} className='rounded-lg border bg-card p-6 transition-shadow hover:shadow-md'>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex-1 cursor-pointer' onClick={() => editEvent(event)}>
                                                <div className='mb-2 flex items-center gap-3'>
                                                    <span className={`rounded px-2 py-1 text-xs ${typeColor}`}>{event.event_type}</span>
                                                    <h3 className='font-semibold hover:text-primary'>{event.title}</h3>
                                                </div>
                                                {event.description && <p className='mb-3 text-muted-foreground'>{event.description}</p>}
                                                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                                    <div className='flex items-center gap-1'>
                                                        <Calendar className='h-4 w-4' />
                                                        {new Date(event.start_datetime).toLocaleDateString()}
                                                    </div>
                                                    {event.start_datetime && (
                                                        <div className='flex items-center gap-1'>
                                                            <Clock className='h-4 w-4' />
                                                            {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {event.end_datetime &&
                                                                ` - ${new Date(event.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                                        </div>
                                                    )}
                                                    {event.location && (
                                                        <div className='flex items-center gap-1'>
                                                            <MapPin className='h-4 w-4' />
                                                            {event.location}
                                                        </div>
                                                    )}
                                                    {event.assignee && (
                                                        <div className='flex items-center gap-1'>
                                                            <User className='h-4 w-4' />
                                                            <span className='capitalize'>{event.assignee}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='ml-4 flex items-center gap-2'>
                                                <button
                                                    onClick={() => editEvent(event)}
                                                    className='rounded p-2 text-muted-foreground hover:bg-secondary hover:text-primary'
                                                    title='Edit event'>
                                                    <Clock className='h-4 w-4' />
                                                </button>
                                                <button
                                                    onClick={() => deleteEvent(event.id)}
                                                    className='rounded p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600'
                                                    title='Delete event'>
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Tasks */}
                            {monthTasks.map((task) => {
                                const status = task.status || 'todo';
                                const typeColor = eventTypeColors[`task-${status}` as keyof typeof eventTypeColors] || eventTypeColors['task-todo'];
                                const taskDate = task.due_date ? parseLocalDate(task.due_date) : new Date(task.created_at);

                                return (
                                    <div key={`task-${task.id}`} className='rounded-lg border border-l-4 border-l-blue-500 bg-card p-6 transition-shadow hover:shadow-md'>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex-1'>
                                                <div className='mb-2 flex items-center gap-3'>
                                                    <CheckSquare className='h-4 w-4' />
                                                    <span className={`rounded px-2 py-1 text-xs ${typeColor}`}>Task - {status}</span>
                                                    <h3 className='font-semibold'>{task.title}</h3>
                                                </div>
                                                {task.description && <p className='mb-3 text-muted-foreground'>{task.description}</p>}
                                                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                                    <div className='flex items-center gap-1'>
                                                        <Calendar className='h-4 w-4' />
                                                        {task.due_date ? `Due: ${taskDate.toLocaleDateString()}` : `Created: ${taskDate.toLocaleDateString()}`}
                                                    </div>
                                                    {task.priority && (
                                                        <div className='flex items-center gap-1'>
                                                            <span className='capitalize'>{task.priority} priority</span>
                                                        </div>
                                                    )}
                                                    {task.assignee && (
                                                        <div className='flex items-center gap-1'>
                                                            <User className='h-4 w-4' />
                                                            <span className='capitalize'>{task.assignee}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div className='py-12 text-center'>
                            <Calendar className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                            <h3 className='mb-2 text-lg font-semibold'>No Events or Tasks This Month</h3>
                            <p className='mb-4 text-muted-foreground'>Add your first event or create tasks to get started.</p>
                            <button onClick={() => setShowEventForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Add Event
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Event Form Modal */}
            {showEventForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Title *</label>
                                <input
                                    type='text'
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    placeholder='Event title'
                                />
                            </div>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Type</label>
                                <select
                                    value={eventForm.event_type}
                                    onChange={(e) => setEventForm((prev) => ({ ...prev, event_type: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value='task'>Task</option>
                                    <option value='meeting'>Meeting</option>
                                    <option value='deadline'>Deadline</option>
                                    <option value='reminder'>Reminder</option>
                                    <option value='personal'>Personal</option>
                                </select>
                            </div>
                            <div className='grid grid-cols-1 gap-4'>
                                <div>
                                    <label className='mb-2 block text-sm font-medium'>Start Date & Time</label>
                                    <input
                                        type='datetime-local'
                                        value={eventForm.start_datetime.slice(0, 16)}
                                        onChange={(e) => setEventForm((prev) => ({ ...prev, start_datetime: e.target.value + ':00.000Z' }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                                <div>
                                    <label className='mb-2 block text-sm font-medium'>End Date & Time *</label>
                                    <input
                                        type='datetime-local'
                                        value={eventForm.end_datetime.slice(0, 16)}
                                        onChange={(e) => setEventForm((prev) => ({ ...prev, end_datetime: e.target.value + ':00.000Z' }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Location</label>
                                <input
                                    type='text'
                                    value={eventForm.location}
                                    onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    placeholder='Event location'
                                />
                            </div>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Priority</label>
                                <select
                                    value={eventForm.priority}
                                    onChange={(e) => setEventForm((prev) => ({ ...prev, priority: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value='low'>Low</option>
                                    <option value='medium'>Medium</option>
                                    <option value='high'>High</option>
                                </select>
                            </div>
                            <div>
                                <label className='mb-2 block text-sm font-medium'>Description</label>
                                <textarea
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                    placeholder='Event description...'
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={saveEvent} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {editingEvent ? 'Update Event' : 'Save Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
