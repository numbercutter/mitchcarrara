'use client';

import { useState } from 'react';
import { Plus, Clock, Edit3, Trash2, Copy, Play, Pause, CheckCircle, Circle } from 'lucide-react';
import type { Tables } from '@/types/database';

type DailyRoutine = Tables<'daily_routines'> & {
    items: Tables<'routine_items'>[];
};

interface RoutinesClientProps {
    initialRoutines: DailyRoutine[];
}

const categoryColors = {
    morning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    workout: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    evening: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    health: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutinesClient({ initialRoutines }: RoutinesClientProps) {
    const [routines, setRoutines] = useState<DailyRoutine[]>(initialRoutines);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const [showNewRoutineForm, setShowNewRoutineForm] = useState(false);
    const [showNewItemForm, setShowNewItemForm] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<string | null>(null);

    const addRoutine = async (routineData: any) => {
        // TODO: Call API to create routine
        console.log('Creating routine:', routineData);
    };

    const addRoutineItem = async (itemData: any) => {
        // TODO: Call API to create routine item
        console.log('Creating routine item:', itemData);
    };

    const updateRoutine = async (id: string, routineData: any) => {
        // TODO: Call API to update routine
        console.log('Updating routine:', id, routineData);
    };

    const deleteRoutine = async (id: string) => {
        // TODO: Call API to delete routine
        console.log('Deleting routine:', id);
    };

    const deleteRoutineItem = async (id: string) => {
        // TODO: Call API to delete routine item
        console.log('Deleting routine item:', id);
    };

    const selectedDayRoutines = routines.filter((routine) => routine.day_of_week === selectedDay && routine.is_active);

    return (
        <div className='flex h-full flex-col'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm pb-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Daily Routines</h1>
                        <p className='text-muted-foreground'>Organize your daily activities and build productive habits</p>
                    </div>
                    <button onClick={() => setShowNewRoutineForm(true)} className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                        <Plus className='h-4 w-4' />
                        New Routine
                    </button>
                </div>

                {/* Day Selector */}
                <div className='mt-6 flex gap-2 overflow-x-auto pb-2'>
                    {dayNames.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDay(index)}
                            className={`flex-shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                selectedDay === index ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                            }`}>
                            {day}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto pt-6'>
            {/* Routines for Selected Day */}
            <div className='space-y-6 pb-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold'>{dayNames[selectedDay]} Routines</h2>
                    {selectedDayRoutines.length > 0 && (
                        <div className='text-sm text-muted-foreground'>
                            {selectedDayRoutines.reduce((total, routine) => total + routine.items.reduce((sum, item) => sum + (item.duration || 0), 0), 0)} minutes total
                        </div>
                    )}
                </div>

                {selectedDayRoutines.length > 0 ? (
                    <div className='space-y-6'>
                        {selectedDayRoutines.map((routine) => (
                            <div key={routine.id} className='rounded-lg border bg-card'>
                                <div className='border-b p-6'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-lg font-semibold'>{routine.name}</h3>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm text-muted-foreground'>{routine.items.reduce((sum, item) => sum + (item.duration || 0), 0)} min</span>
                                            <button onClick={() => setEditingRoutine(routine.id)} className='rounded p-1 hover:bg-accent'>
                                                <Edit3 className='h-4 w-4' />
                                            </button>
                                            <button onClick={() => deleteRoutine(routine.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                                <Trash2 className='h-4 w-4' />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Routine Items */}
                                <div className='p-6'>
                                    {routine.items.length > 0 ? (
                                        <div className='space-y-3'>
                                            {routine.items.map((item, index) => {
                                                const categoryColor = categoryColors[item.category as keyof typeof categoryColors] || categoryColors.other;
                                                return (
                                                    <div key={item.id} className='flex items-center gap-4 rounded-lg border bg-accent/30 p-4'>
                                                        <div className='flex flex-1 items-center gap-3'>
                                                            <span className='w-6 text-sm text-muted-foreground'>{index + 1}.</span>
                                                            <div className='flex-1'>
                                                                <div className='mb-1 flex items-center gap-2'>
                                                                    <h4 className='font-medium'>{item.name}</h4>
                                                                    <span className={`rounded px-2 py-1 text-xs ${categoryColor}`}>{item.category}</span>
                                                                </div>
                                                                {item.description && <p className='text-sm text-muted-foreground'>{item.description}</p>}
                                                            </div>
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                                                <Clock className='h-4 w-4' />
                                                                {item.duration} min
                                                            </div>
                                                            <button
                                                                onClick={() => deleteRoutineItem(item.id)}
                                                                className='rounded p-1 text-destructive opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100'>
                                                                <Trash2 className='h-4 w-4' />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className='py-8 text-center text-muted-foreground'>
                                            <Circle className='mx-auto mb-2 h-8 w-8 opacity-50' />
                                            <p className='text-sm'>No items in this routine</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setShowNewItemForm(true);
                                            // Set routine ID for new item
                                        }}
                                        className='mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary/80'>
                                        <Plus className='h-4 w-4' />
                                        Add Item
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='py-12 text-center'>
                        <Circle className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                        <h3 className='mb-2 text-lg font-semibold'>No Routines for {dayNames[selectedDay]}</h3>
                        <p className='mb-4 text-muted-foreground'>Create your first routine for this day.</p>
                        <button onClick={() => setShowNewRoutineForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            Create Routine
                        </button>
                    </div>
                )}
            </div>

            {/* Overview of All Days */}
            <div className='space-y-4'>
                <h2 className='text-xl font-semibold'>Weekly Overview</h2>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {dayNames.map((day, index) => {
                        const dayRoutines = routines.filter((routine) => routine.day_of_week === index && routine.is_active);
                        const totalItems = dayRoutines.reduce((sum, routine) => sum + routine.items.length, 0);
                        const totalDuration = dayRoutines.reduce((sum, routine) => sum + routine.items.reduce((itemSum, item) => itemSum + (item.duration || 0), 0), 0);

                        return (
                            <div key={index} className='rounded-lg border bg-card p-4'>
                                <div className='mb-2 flex items-center justify-between'>
                                    <h4 className='font-medium'>{day}</h4>
                                    <span className='text-sm text-muted-foreground'>
                                        {dayRoutines.length} routine{dayRoutines.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                    {totalItems} items • {totalDuration} minutes
                                </div>
                                {dayRoutines.length > 0 && (
                                    <div className='mt-2 space-y-1'>
                                        {dayRoutines.slice(0, 2).map((routine) => (
                                            <div key={routine.id} className='text-sm text-muted-foreground'>
                                                • {routine.name}
                                            </div>
                                        ))}
                                        {dayRoutines.length > 2 && <div className='text-sm text-muted-foreground'>+{dayRoutines.length - 2} more</div>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TODO: Add Routine and Item Forms */}
            {showNewRoutineForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>Create New Routine</h3>
                        <p className='mb-4 text-muted-foreground'>Routine creation form will be implemented here.</p>
                        <div className='flex gap-2'>
                            <button onClick={() => setShowNewRoutineForm(false)} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>Create Routine</button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
