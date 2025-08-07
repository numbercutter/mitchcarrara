'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, Calendar, Clock, Target, TrendingUp, Pill, Apple, LayoutDashboard } from 'lucide-react';

interface Supplement {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    timeOfDay: string[];
    notes: string;
    startDate: string;
    isActive: boolean;
}

interface Meal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    time: string;
    date: string;
    notes: string;
}

interface WorkoutLog {
    id: string;
    name: string;
    type: 'strength' | 'cardio' | 'flexibility' | 'sports';
    duration: number;
    date: string;
    exercises: string[];
    notes: string;
    intensity: 1 | 2 | 3 | 4 | 5;
}

export default function HealthFitnessPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'diet' | 'supplements' | 'workouts' | 'goals'>('overview');

    const [supplements, setSupplements] = useState<Supplement[]>([
        {
            id: '1',
            name: 'Vitamin D3',
            dosage: '5000 IU',
            frequency: 'Daily',
            timeOfDay: ['morning'],
            notes: 'With breakfast for better absorption',
            startDate: '2024-01-01',
            isActive: true
        },
        {
            id: '2',
            name: 'Omega-3',
            dosage: '1000mg',
            frequency: 'Twice daily',
            timeOfDay: ['morning', 'evening'],
            notes: 'High quality fish oil',
            startDate: '2024-01-01',
            isActive: true
        },
        {
            id: '3',
            name: 'Magnesium Glycinate',
            dosage: '400mg',
            frequency: 'Daily',
            timeOfDay: ['evening'],
            notes: 'For better sleep and recovery',
            startDate: '2024-01-01',
            isActive: true
        }
    ]);

    const [meals, setMeals] = useState<Meal[]>([
        {
            id: '1',
            name: 'Greek Yogurt Bowl',
            calories: 320,
            protein: 25,
            carbs: 28,
            fats: 12,
            time: '08:00',
            date: '2024-01-15',
            notes: 'With berries, nuts, and honey'
        },
        {
            id: '2',
            name: 'Grilled Chicken Salad',
            calories: 450,
            protein: 35,
            carbs: 15,
            fats: 28,
            time: '12:30',
            date: '2024-01-15',
            notes: 'Mixed greens, avocado, olive oil dressing'
        }
    ]);

    const [workouts, setWorkouts] = useState<WorkoutLog[]>([
        {
            id: '1',
            name: 'Upper Body Strength',
            type: 'strength',
            duration: 60,
            date: '2024-01-15',
            exercises: ['Bench Press', 'Pull-ups', 'Overhead Press', 'Rows'],
            notes: 'Focused on progressive overload',
            intensity: 4
        },
        {
            id: '2',
            name: 'Morning Run',
            type: 'cardio',
            duration: 30,
            date: '2024-01-14',
            exercises: ['5K Run'],
            notes: 'Easy pace, recovery run',
            intensity: 3
        }
    ]);

    const [showSupplementForm, setShowSupplementForm] = useState(false);
    const [showMealForm, setShowMealForm] = useState(false);
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);

    const [newSupplement, setNewSupplement] = useState({
        name: '',
        dosage: '',
        frequency: '',
        timeOfDay: [] as string[],
        notes: ''
    });

    const [newMeal, setNewMeal] = useState({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        time: '',
        notes: ''
    });

    const todayMeals = meals.filter(meal => meal.date === new Date().toISOString().split('T')[0]);
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);

    const addSupplement = () => {
        if (!newSupplement.name.trim()) return;
        
        const supplement: Supplement = {
            id: Date.now().toString(),
            ...newSupplement,
            startDate: new Date().toISOString().split('T')[0],
            isActive: true
        };
        
        setSupplements([...supplements, supplement]);
        setNewSupplement({ name: '', dosage: '', frequency: '', timeOfDay: [], notes: '' });
        setShowSupplementForm(false);
    };

    const addMeal = () => {
        if (!newMeal.name.trim()) return;
        
        const meal: Meal = {
            id: Date.now().toString(),
            ...newMeal,
            date: new Date().toISOString().split('T')[0]
        };
        
        setMeals([...meals, meal]);
        setNewMeal({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0, time: '', notes: '' });
        setShowMealForm(false);
    };

    const renderOverview = () => (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Apple className='h-4 w-4 text-green-600' />
                        <span className='text-sm text-muted-foreground'>Calories Today</span>
                    </div>
                    <p className='text-2xl font-bold'>{totalCalories}</p>
                    <p className='text-xs text-muted-foreground'>Goal: 2400</p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Target className='h-4 w-4 text-blue-600' />
                        <span className='text-sm text-muted-foreground'>Protein</span>
                    </div>
                    <p className='text-2xl font-bold'>{totalProtein}g</p>
                    <p className='text-xs text-muted-foreground'>Goal: 150g</p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Pill className='h-4 w-4 text-purple-600' />
                        <span className='text-sm text-muted-foreground'>Supplements</span>
                    </div>
                    <p className='text-2xl font-bold'>{supplements.filter(s => s.isActive).length}</p>
                    <p className='text-xs text-muted-foreground'>Active</p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <TrendingUp className='h-4 w-4 text-orange-600' />
                        <span className='text-sm text-muted-foreground'>Workouts This Week</span>
                    </div>
                    <p className='text-2xl font-bold'>4</p>
                    <p className='text-xs text-muted-foreground'>Goal: 5</p>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold'>Today\'s Nutrition</h3>
                    <div className='space-y-3'>
                        {todayMeals.map(meal => (
                            <div key={meal.id} className='flex justify-between items-center'>
                                <div>
                                    <p className='font-medium text-sm'>{meal.name}</p>
                                    <p className='text-xs text-muted-foreground'>{meal.time}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm font-medium'>{meal.calories} cal</p>
                                    <p className='text-xs text-muted-foreground'>{meal.protein}g protein</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold'>Recent Workouts</h3>
                    <div className='space-y-3'>
                        {workouts.slice(0, 3).map(workout => (
                            <div key={workout.id} className='flex justify-between items-center'>
                                <div>
                                    <p className='font-medium text-sm'>{workout.name}</p>
                                    <p className='text-xs text-muted-foreground'>{workout.date}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm'>{workout.duration}min</p>
                                    <div className='flex gap-1'>
                                        {Array.from({length: 5}, (_, i) => (
                                            <div key={i} className={`h-1 w-2 rounded ${i < workout.intensity ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSupplements = () => (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Supplement Stack</h3>
                <button
                    onClick={() => setShowSupplementForm(true)}
                    className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                    <Plus className='h-4 w-4' />
                    Add Supplement
                </button>
            </div>

            {showSupplementForm && (
                <div className='rounded-lg border bg-card p-6'>
                    <h4 className='mb-4 font-medium'>Add New Supplement</h4>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Name</label>
                            <input
                                type='text'
                                value={newSupplement.name}
                                onChange={(e) => setNewSupplement({...newSupplement, name: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='Supplement name...'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Dosage</label>
                            <input
                                type='text'
                                value={newSupplement.dosage}
                                onChange={(e) => setNewSupplement({...newSupplement, dosage: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='e.g., 1000mg, 2 capsules...'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Frequency</label>
                            <select
                                value={newSupplement.frequency}
                                onChange={(e) => setNewSupplement({...newSupplement, frequency: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value=''>Select frequency</option>
                                <option value='Daily'>Daily</option>
                                <option value='Twice daily'>Twice daily</option>
                                <option value='3x daily'>3x daily</option>
                                <option value='Weekly'>Weekly</option>
                                <option value='As needed'>As needed</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Time of Day</label>
                            <div className='flex gap-2'>
                                {['morning', 'afternoon', 'evening'].map(time => (
                                    <label key={time} className='flex items-center gap-1'>
                                        <input
                                            type='checkbox'
                                            checked={newSupplement.timeOfDay.includes(time)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewSupplement({...newSupplement, timeOfDay: [...newSupplement.timeOfDay, time]});
                                                } else {
                                                    setNewSupplement({...newSupplement, timeOfDay: newSupplement.timeOfDay.filter(t => t !== time)});
                                                }
                                            }}
                                            className='rounded'
                                        />
                                        <span className='text-sm capitalize'>{time}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium mb-1'>Notes</label>
                            <textarea
                                value={newSupplement.notes}
                                onChange={(e) => setNewSupplement({...newSupplement, notes: e.target.value})}
                                className='w-full resize-none rounded border bg-background px-3 py-2 text-sm'
                                rows={2}
                                placeholder='Special instructions, benefits, etc...'
                            />
                        </div>
                    </div>
                    <div className='flex justify-end gap-2 mt-4'>
                        <button
                            onClick={() => setShowSupplementForm(false)}
                            className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'>
                            Cancel
                        </button>
                        <button
                            onClick={addSupplement}
                            className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                            Add Supplement
                        </button>
                    </div>
                </div>
            )}

            <div className='grid gap-4'>
                {supplements.map(supplement => (
                    <div key={supplement.id} className='rounded-lg border bg-card p-4'>
                        <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-1'>
                                    <h4 className='font-medium'>{supplement.name}</h4>
                                    <span className='px-2 py-1 rounded-full text-xs bg-green-100 text-green-700'>
                                        {supplement.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground'>
                                    <div>
                                        <span className='font-medium'>Dosage:</span> {supplement.dosage}
                                    </div>
                                    <div>
                                        <span className='font-medium'>Frequency:</span> {supplement.frequency}
                                    </div>
                                    <div>
                                        <span className='font-medium'>Time:</span> {supplement.timeOfDay.join(', ')}
                                    </div>
                                    <div>
                                        <span className='font-medium'>Since:</span> {supplement.startDate}
                                    </div>
                                </div>
                                {supplement.notes && (
                                    <p className='text-sm text-muted-foreground mt-2'>{supplement.notes}</p>
                                )}
                            </div>
                            <button className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                <Edit3 className='h-4 w-4' />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'diet', label: 'Nutrition', icon: Apple },
        { id: 'supplements', label: 'Supplements', icon: Pill },
        { id: 'workouts', label: 'Workouts', icon: Target },
        { id: 'goals', label: 'Goals', icon: TrendingUp }
    ];

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-3xl font-bold'>Health & Fitness</h1>
                <p className='mt-2 text-muted-foreground'>Track your nutrition, supplements, workouts, and health goals.</p>
            </div>

            <div className='border-b'>
                <nav className='flex space-x-8'>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                                <Icon className='h-4 w-4' />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'supplements' && renderSupplements()}
                {activeTab === 'diet' && (
                    <div className='text-center py-12'>
                        <Apple className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>Nutrition Tracking</h3>
                        <p className='text-muted-foreground'>Detailed meal planning and nutrition tracking coming soon.</p>
                    </div>
                )}
                {activeTab === 'workouts' && (
                    <div className='text-center py-12'>
                        <Target className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>Workout Tracking</h3>
                        <p className='text-muted-foreground'>Exercise logging and fitness progress tracking coming soon.</p>
                    </div>
                )}
                {activeTab === 'goals' && (
                    <div className='text-center py-12'>
                        <TrendingUp className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>Health Goals</h3>
                        <p className='text-muted-foreground'>Goal setting and progress tracking coming soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
}