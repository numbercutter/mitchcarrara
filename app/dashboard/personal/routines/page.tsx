'use client';

import { useState } from 'react';
import { Plus, Clock, Edit3, Trash2, Copy, Play, Pause, CheckCircle, Circle } from 'lucide-react';

interface RoutineItem {
    id: string;
    name: string;
    duration: number; // in minutes
    description: string;
    category: 'morning' | 'workout' | 'work' | 'evening' | 'health' | 'other';
    isCompleted?: boolean;
}

interface DailyRoutine {
    id: string;
    name: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    items: RoutineItem[];
    isActive: boolean;
}

const categoryColors = {
    morning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    workout: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    evening: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    health: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutinesPage() {
    const [routines, setRoutines] = useState<DailyRoutine[]>([
        {
            id: '1',
            name: 'Monday Power Start',
            dayOfWeek: 1,
            isActive: true,
            items: [
                {
                    id: '1',
                    name: 'Wake Up & Hydrate',
                    duration: 5,
                    description: 'Drink 16oz of water immediately upon waking',
                    category: 'morning'
                },
                {
                    id: '2',
                    name: 'Meditation',
                    duration: 10,
                    description: 'Headspace morning meditation session',
                    category: 'health'
                },
                {
                    id: '3',
                    name: 'Review Daily Priorities',
                    duration: 15,
                    description: 'Check calendar, review top 3 priorities for the day',
                    category: 'work'
                },
                {
                    id: '4',
                    name: 'Workout',
                    duration: 60,
                    description: 'Strength training - upper body focus',
                    category: 'workout'
                },
                {
                    id: '5',
                    name: 'Healthy Breakfast',
                    duration: 20,
                    description: 'High protein breakfast with supplements',
                    category: 'morning'
                }
            ]
        },
        {
            id: '2',
            name: 'Wednesday Check-in',
            dayOfWeek: 3,
            isActive: true,
            items: [
                {
                    id: '6',
                    name: 'Weekly Review',
                    duration: 30,
                    description: 'Review progress on weekly goals and adjust plans',
                    category: 'work'
                },
                {
                    id: '7',
                    name: 'Cardio Session',
                    duration: 45,
                    description: '5K run or equivalent cardio',
                    category: 'workout'
                },
                {
                    id: '8',
                    name: 'Meal Prep Planning',
                    duration: 25,
                    description: 'Plan meals for rest of week, grocery list',
                    category: 'health'
                }
            ]
        },
        {
            id: '3',
            name: 'Sunday Reset',
            dayOfWeek: 0,
            isActive: true,
            items: [
                {
                    id: '9',
                    name: 'Week Planning',
                    duration: 45,
                    description: 'Plan upcoming week, schedule important tasks',
                    category: 'work'
                },
                {
                    id: '10',
                    name: 'Meal Prep',
                    duration: 90,
                    description: 'Batch cook meals for the week',
                    category: 'health'
                },
                {
                    id: '11',
                    name: 'Personal Projects',
                    duration: 60,
                    description: 'Work on side projects or learning',
                    category: 'other'
                },
                {
                    id: '12',
                    name: 'Wind Down Routine',
                    duration: 30,
                    description: 'Reading, journaling, prepare for the week ahead',
                    category: 'evening'
                }
            ]
        }
    ]);

    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const [showNewRoutineForm, setShowNewRoutineForm] = useState(false);
    const [showNewItemForm, setShowNewItemForm] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<string | null>(null);

    const [newRoutine, setNewRoutine] = useState({
        name: '',
        dayOfWeek: selectedDay
    });

    const [newItem, setNewItem] = useState({
        name: '',
        duration: 0,
        description: '',
        category: 'other' as RoutineItem['category'],
        routineId: ''
    });

    const todayRoutines = routines.filter(routine => routine.dayOfWeek === selectedDay && routine.isActive);
    const selectedDayRoutines = routines.filter(routine => routine.dayOfWeek === selectedDay);

    const addRoutine = () => {
        if (!newRoutine.name.trim()) return;

        const routine: DailyRoutine = {
            id: Date.now().toString(),
            name: newRoutine.name,
            dayOfWeek: newRoutine.dayOfWeek,
            items: [],
            isActive: true
        };

        setRoutines([...routines, routine]);
        setNewRoutine({ name: '', dayOfWeek: selectedDay });
        setShowNewRoutineForm(false);
    };

    const addItem = () => {
        if (!newItem.name.trim() || !newItem.routineId) return;

        const item: RoutineItem = {
            id: Date.now().toString(),
            name: newItem.name,
            duration: newItem.duration,
            description: newItem.description,
            category: newItem.category
        };

        setRoutines(routines.map(routine => 
            routine.id === newItem.routineId 
                ? { ...routine, items: [...routine.items, item] }
                : routine
        ));

        setNewItem({ name: '', duration: 0, description: '', category: 'other', routineId: '' });
        setShowNewItemForm(false);
    };

    const toggleItemCompletion = (routineId: string, itemId: string) => {
        setRoutines(routines.map(routine =>
            routine.id === routineId
                ? {
                    ...routine,
                    items: routine.items.map(item =>
                        item.id === itemId
                            ? { ...item, isCompleted: !item.isCompleted }
                            : item
                    )
                }
                : routine
        ));
    };

    const duplicateRoutine = (routineId: string, targetDay: number) => {
        const routine = routines.find(r => r.id === routineId);
        if (!routine) return;

        const duplicatedRoutine: DailyRoutine = {
            ...routine,
            id: Date.now().toString(),
            name: `${routine.name} (Copy)`,
            dayOfWeek: targetDay,
            items: routine.items.map(item => ({ ...item, id: Date.now().toString() + Math.random() }))
        };

        setRoutines([...routines, duplicatedRoutine]);
    };

    const getTotalDuration = (items: RoutineItem[]) => {
        return items.reduce((total, item) => total + item.duration, 0);
    };

    const getCompletionRate = (items: RoutineItem[]) => {
        if (items.length === 0) return 0;
        const completed = items.filter(item => item.isCompleted).length;
        return Math.round((completed / items.length) * 100);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
        }
        return `${mins}m`;
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Daily Routines</h1>
                    <p className='mt-2 text-muted-foreground'>Organize your week with structured daily routines.</p>
                </div>
                <button
                    onClick={() => setShowNewRoutineForm(true)}
                    className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                    <Plus className='h-4 w-4' />
                    New Routine
                </button>
            </div>

            {/* Day Selector */}
            <div className='flex items-center justify-center'>
                <div className='flex rounded-lg border p-1'>
                    {dayNames.map((day, index) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(index)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                selectedDay === index
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            }`}>
                            {day.substring(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Weekly Overview */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Clock className='h-4 w-4 text-blue-600' />
                        <span className='text-sm text-muted-foreground'>Today\'s Duration</span>
                    </div>
                    <p className='text-2xl font-bold'>
                        {formatDuration(todayRoutines.reduce((total, routine) => total + getTotalDuration(routine.items), 0))}
                    </p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <CheckCircle className='h-4 w-4 text-green-600' />
                        <span className='text-sm text-muted-foreground'>Completion Rate</span>
                    </div>
                    <p className='text-2xl font-bold'>
                        {todayRoutines.length > 0 
                            ? Math.round(todayRoutines.reduce((acc, routine) => acc + getCompletionRate(routine.items), 0) / todayRoutines.length)
                            : 0}%
                    </p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Play className='h-4 w-4 text-purple-600' />
                        <span className='text-sm text-muted-foreground'>Active Routines</span>
                    </div>
                    <p className='text-2xl font-bold'>{routines.filter(r => r.isActive).length}</p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Clock className='h-4 w-4 text-orange-600' />
                        <span className='text-sm text-muted-foreground'>Weekly Time</span>
                    </div>
                    <p className='text-2xl font-bold'>
                        {formatDuration(routines.reduce((total, routine) => total + getTotalDuration(routine.items), 0))}
                    </p>
                </div>
            </div>

            {/* New Routine Form */}
            {showNewRoutineForm && (
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold'>Create New Routine</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Routine Name</label>
                            <input
                                type='text'
                                value={newRoutine.name}
                                onChange={(e) => setNewRoutine({...newRoutine, name: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='Morning routine, Evening wind-down...'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Day of Week</label>
                            <select
                                value={newRoutine.dayOfWeek}
                                onChange={(e) => setNewRoutine({...newRoutine, dayOfWeek: parseInt(e.target.value)})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                {dayNames.map((day, index) => (
                                    <option key={day} value={index}>{day}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='flex justify-end gap-2 mt-4'>
                        <button
                            onClick={() => setShowNewRoutineForm(false)}
                            className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'>
                            Cancel
                        </button>
                        <button
                            onClick={addRoutine}
                            className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                            Create Routine
                        </button>
                    </div>
                </div>
            )}

            {/* New Item Form */}
            {showNewItemForm && (
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold'>Add Routine Item</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Activity Name</label>
                            <input
                                type='text'
                                value={newItem.name}
                                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='Meditation, Workout, Review emails...'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Duration (minutes)</label>
                            <input
                                type='number'
                                value={newItem.duration || ''}
                                onChange={(e) => setNewItem({...newItem, duration: parseInt(e.target.value) || 0})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='30'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Category</label>
                            <select
                                value={newItem.category}
                                onChange={(e) => setNewItem({...newItem, category: e.target.value as RoutineItem['category']})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value='morning'>Morning</option>
                                <option value='workout'>Workout</option>
                                <option value='work'>Work</option>
                                <option value='evening'>Evening</option>
                                <option value='health'>Health</option>
                                <option value='other'>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Add to Routine</label>
                            <select
                                value={newItem.routineId}
                                onChange={(e) => setNewItem({...newItem, routineId: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value=''>Select routine...</option>
                                {selectedDayRoutines.map(routine => (
                                    <option key={routine.id} value={routine.id}>{routine.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium mb-1'>Description</label>
                            <textarea
                                value={newItem.description}
                                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                className='w-full resize-none rounded border bg-background px-3 py-2 text-sm'
                                rows={2}
                                placeholder='Brief description or specific instructions...'
                            />
                        </div>
                    </div>
                    <div className='flex justify-end gap-2 mt-4'>
                        <button
                            onClick={() => setShowNewItemForm(false)}
                            className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'>
                            Cancel
                        </button>
                        <button
                            onClick={addItem}
                            className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                            Add Item
                        </button>
                    </div>
                </div>
            )}

            {/* Current Day Header */}
            <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>{dayNames[selectedDay]} Routines</h2>
                <div className='flex gap-2'>
                    <button
                        onClick={() => setShowNewItemForm(true)}
                        disabled={selectedDayRoutines.length === 0}
                        className='flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-secondary disabled:opacity-50'>
                        <Plus className='h-4 w-4' />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Routines List */}
            <div className='space-y-4'>
                {selectedDayRoutines.map(routine => (
                    <div key={routine.id} className='rounded-lg border bg-card p-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-3'>
                                <h3 className='text-lg font-semibold'>{routine.name}</h3>
                                <span className='text-sm text-muted-foreground'>
                                    {formatDuration(getTotalDuration(routine.items))}
                                </span>
                                <span className='text-sm text-green-600'>
                                    {getCompletionRate(routine.items)}% complete
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => {
                                        const targetDay = (selectedDay + 1) % 7;
                                        duplicateRoutine(routine.id, targetDay);
                                    }}
                                    className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                    <Copy className='h-4 w-4' />
                                </button>
                                <button className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                    <Edit3 className='h-4 w-4' />
                                </button>
                            </div>
                        </div>

                        <div className='space-y-3'>
                            {routine.items.map((item, index) => (
                                <div key={item.id} className='flex items-center gap-4 p-3 rounded-lg bg-secondary/20'>
                                    <button
                                        onClick={() => toggleItemCompletion(routine.id, item.id)}
                                        className={`flex-shrink-0 ${item.isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {item.isCompleted ? (
                                            <CheckCircle className='h-5 w-5' />
                                        ) : (
                                            <Circle className='h-5 w-5' />
                                        )}
                                    </button>
                                    
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <h4 className={`font-medium ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                                {item.name}
                                            </h4>
                                            <span className={`px-2 py-1 rounded-full text-xs ${categoryColors[item.category]}`}>
                                                {item.category}
                                            </span>
                                            <span className='text-xs text-muted-foreground'>
                                                {formatDuration(item.duration)}
                                            </span>
                                        </div>
                                        <p className='text-sm text-muted-foreground'>{item.description}</p>
                                    </div>

                                    <div className='text-right text-sm text-muted-foreground'>
                                        #{index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {routine.items.length === 0 && (
                            <div className='text-center py-8'>
                                <Clock className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
                                <p className='text-sm text-muted-foreground'>No items in this routine yet</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedDayRoutines.length === 0 && (
                <div className='text-center py-12'>
                    <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50'>
                        <Clock className='h-8 w-8 text-muted-foreground' />
                    </div>
                    <h3 className='text-lg font-semibold'>No routines for {dayNames[selectedDay]}</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>Create your first routine to get started</p>
                </div>
            )}
        </div>
    );
}