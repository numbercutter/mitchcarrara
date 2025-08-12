'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, Calendar, Clock, Target, TrendingUp, Pill, Apple, LayoutDashboard } from 'lucide-react';
import type { Tables } from '@/types/database';

type Supplement = Tables<'supplements'>;
type Meal = Tables<'meals'>;
type WorkoutLog = Tables<'workout_logs'>;
type HealthMetric = Tables<'health_metrics'>;

interface HealthClientProps {
    initialSupplements: Supplement[];
    initialMeals: Meal[];
    initialWorkouts: WorkoutLog[];
    initialHealthMetrics: HealthMetric[];
}

export default function HealthClient({ initialSupplements, initialMeals, initialWorkouts, initialHealthMetrics }: HealthClientProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'diet' | 'supplements' | 'workouts' | 'goals'>('overview');
    const [supplements, setSupplements] = useState<Supplement[]>(initialSupplements);
    const [meals, setMeals] = useState<Meal[]>(initialMeals);
    const [workouts, setWorkouts] = useState<WorkoutLog[]>(initialWorkouts);
    const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(initialHealthMetrics);

    const [showSupplementForm, setShowSupplementForm] = useState(false);
    const [showMealForm, setShowMealForm] = useState(false);
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);

    const [supplementForm, setSupplementForm] = useState({
        name: '',
        dosage: '',
        frequency: '',
        time_of_day: [] as string[],
        notes: '',
        is_active: true,
    });

    const [mealForm, setMealForm] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        meal_time: '',
        meal_date: new Date().toISOString().split('T')[0],
    });

    const [workoutForm, setWorkoutForm] = useState({
        name: '',
        type: '',
        duration: '',
        calories_burned: '',
        workout_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Calculate today's nutrition totals
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter((meal) => meal.meal_date === today);
    const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFats = todayMeals.reduce((sum, meal) => sum + (meal.fats || 0), 0);

    // Form reset functions
    const resetSupplementForm = () => {
        setSupplementForm({
            name: '',
            dosage: '',
            frequency: '',
            time_of_day: [],
            notes: '',
            is_active: true,
        });
        setShowSupplementForm(false);
    };

    const resetMealForm = () => {
        setMealForm({
            name: '',
            calories: '',
            protein: '',
            carbs: '',
            fats: '',
            meal_time: '',
            meal_date: new Date().toISOString().split('T')[0],
        });
        setShowMealForm(false);
    };

    const resetWorkoutForm = () => {
        setWorkoutForm({
            name: '',
            type: '',
            duration: '',
            calories_burned: '',
            workout_date: new Date().toISOString().split('T')[0],
            notes: '',
        });
        setShowWorkoutForm(false);
    };

    // Add functions (will call APIs)
    const addSupplement = async () => {
        if (!supplementForm.name.trim()) return;

        try {
            const response = await fetch('/api/health-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metric_type: 'supplement',
                    metric_name: supplementForm.name,
                    metric_value: supplementForm.dosage,
                    notes: JSON.stringify(supplementForm),
                }),
            });

            if (!response.ok) throw new Error('Failed to create supplement');

            const newSupplement = await response.json();
            setSupplements((prev) => [...prev, newSupplement]);
            resetSupplementForm();
        } catch (error) {
            console.error('Error creating supplement:', error);
        }
    };

    const addMeal = async () => {
        if (!mealForm.name.trim()) return;

        try {
            const response = await fetch('/api/health-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metric_type: 'meal',
                    metric_name: mealForm.name,
                    metric_value: mealForm.calories.toString(),
                    notes: JSON.stringify(mealForm),
                }),
            });

            if (!response.ok) throw new Error('Failed to create meal');

            const newMeal = await response.json();
            setMeals((prev) => [...prev, newMeal]);
            resetMealForm();
        } catch (error) {
            console.error('Error creating meal:', error);
        }
    };

    const addWorkout = async () => {
        if (!workoutForm.name.trim()) return;

        try {
            const response = await fetch('/api/workout-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: workoutForm.name,
                    type: workoutForm.type,
                    duration: parseInt(workoutForm.duration) || 0,
                    calories_burned: parseInt(workoutForm.calories_burned) || 0,
                    workout_date: workoutForm.workout_date,
                    notes: workoutForm.notes,
                }),
            });

            if (!response.ok) throw new Error('Failed to create workout');

            const newWorkout = await response.json();
            setWorkouts((prev) => [...prev, newWorkout]);
            resetWorkoutForm();
        } catch (error) {
            console.error('Error creating workout:', error);
        }
    };

    const updateSupplement = async (id: string, data: any) => {
        try {
            const response = await fetch(`/api/health-metrics/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update supplement');

            const updatedSupplement = await response.json();
            setSupplements((prev) => prev.map((s) => (s.id === id ? updatedSupplement : s)));
        } catch (error) {
            console.error('Error updating supplement:', error);
        }
    };

    const deleteSupplement = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplement?')) return;

        try {
            const response = await fetch(`/api/health-metrics/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete supplement');

            setSupplements((prev) => prev.filter((s) => s.id !== id));
        } catch (error) {
            console.error('Error deleting supplement:', error);
        }
    };

    const deleteWorkout = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workout?')) return;

        try {
            const response = await fetch(`/api/workout-logs/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete workout');

            setWorkouts((prev) => prev.filter((w) => w.id !== id));
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div>
                <h1 className='text-3xl font-bold'>Health & Fitness</h1>
                <p className='text-muted-foreground'>Track your nutrition, supplements, workouts, and health metrics</p>
            </div>

            {/* Tab Navigation */}
            <div className='border-b'>
                <nav className='flex space-x-8'>
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'diet', label: 'Diet', icon: Apple },
                        { id: 'supplements', label: 'Supplements', icon: Pill },
                        { id: 'workouts', label: 'Workouts', icon: TrendingUp },
                        { id: 'goals', label: 'Goals', icon: Target },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                                    activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                                <Icon className='h-4 w-4' />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className='space-y-6'>
                    {/* Today's Stats */}
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-medium'>Calories</h3>
                                <Apple className='h-4 w-4 text-muted-foreground' />
                            </div>
                            <div className='mt-2'>
                                <p className='text-2xl font-bold'>{totalCalories}</p>
                                <p className='text-xs text-muted-foreground'>kcal today</p>
                            </div>
                        </div>
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-medium'>Protein</h3>
                                <TrendingUp className='h-4 w-4 text-muted-foreground' />
                            </div>
                            <div className='mt-2'>
                                <p className='text-2xl font-bold'>{totalProtein}g</p>
                                <p className='text-xs text-muted-foreground'>today</p>
                            </div>
                        </div>
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-medium'>Carbs</h3>
                                <Calendar className='h-4 w-4 text-muted-foreground' />
                            </div>
                            <div className='mt-2'>
                                <p className='text-2xl font-bold'>{totalCarbs}g</p>
                                <p className='text-xs text-muted-foreground'>today</p>
                            </div>
                        </div>
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-medium'>Fats</h3>
                                <Pill className='h-4 w-4 text-muted-foreground' />
                            </div>
                            <div className='mt-2'>
                                <p className='text-2xl font-bold'>{totalFats}g</p>
                                <p className='text-xs text-muted-foreground'>today</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className='grid gap-6 lg:grid-cols-2'>
                        {/* Recent Meals */}
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center justify-between'>
                                <h3 className='font-semibold'>Today's Meals</h3>
                                <button onClick={() => setShowMealForm(true)} className='text-primary hover:text-primary/80'>
                                    <Plus className='h-4 w-4' />
                                </button>
                            </div>
                            <div className='space-y-3'>
                                {todayMeals.length > 0 ? (
                                    todayMeals.map((meal) => (
                                        <div key={meal.id} className='flex items-center justify-between rounded bg-accent/30 p-3'>
                                            <div>
                                                <p className='font-medium'>{meal.name}</p>
                                                <p className='text-sm text-muted-foreground'>
                                                    {meal.calories} kcal • {meal.protein}g protein
                                                </p>
                                            </div>
                                            <span className='text-sm text-muted-foreground'>{meal.meal_time}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className='py-4 text-center text-muted-foreground'>No meals logged today</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Workouts */}
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center justify-between'>
                                <h3 className='font-semibold'>Recent Workouts</h3>
                                <button onClick={() => setShowWorkoutForm(true)} className='text-primary hover:text-primary/80'>
                                    <Plus className='h-4 w-4' />
                                </button>
                            </div>
                            <div className='space-y-3'>
                                {workouts.slice(0, 5).map((workout) => (
                                    <div key={workout.id} className='flex items-center justify-between rounded bg-accent/30 p-3'>
                                        <div>
                                            <p className='font-medium'>{workout.name}</p>
                                            <p className='text-sm text-muted-foreground'>
                                                {workout.duration} min • {workout.type}
                                            </p>
                                        </div>
                                        <span className='text-sm text-muted-foreground'>{new Date(workout.workout_date).toLocaleDateString()}</span>
                                    </div>
                                ))}
                                {workouts.length === 0 && <p className='py-4 text-center text-muted-foreground'>No workouts logged yet</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'supplements' && (
                <div className='space-y-6'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-xl font-semibold'>Supplements</h2>
                        <button
                            onClick={() => setShowSupplementForm(true)}
                            className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            <Plus className='h-4 w-4' />
                            Add Supplement
                        </button>
                    </div>

                    {supplements.length > 0 ? (
                        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {supplements.map((supplement) => (
                                <div key={supplement.id} className='rounded-lg border bg-card p-6'>
                                    <div className='mb-3 flex items-start justify-between'>
                                        <div>
                                            <h3 className='font-semibold'>{supplement.name}</h3>
                                            <p className='text-sm text-muted-foreground'>
                                                {supplement.dosage} • {supplement.frequency}
                                            </p>
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <button onClick={() => updateSupplement(supplement.id, { is_active: !supplement.is_active })} className='rounded p-1 hover:bg-accent'>
                                                <Edit3 className='h-4 w-4' />
                                            </button>
                                            <button onClick={() => deleteSupplement(supplement.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                                <Trash2 className='h-4 w-4' />
                                            </button>
                                        </div>
                                    </div>
                                    {supplement.time_of_day && (
                                        <div className='mb-3'>
                                            <p className='mb-1 text-sm font-medium'>Time of day:</p>
                                            <div className='flex flex-wrap gap-1'>
                                                {(supplement.time_of_day as string[]).map((time, index) => (
                                                    <span key={index} className='rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                                        {time}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {supplement.notes && <p className='text-sm text-muted-foreground'>{supplement.notes}</p>}
                                    <div
                                        className={`mt-3 inline-flex rounded px-2 py-1 text-xs ${
                                            supplement.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                                        }`}>
                                        {supplement.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='py-12 text-center'>
                            <Pill className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                            <h3 className='mb-2 text-lg font-semibold'>No Supplements</h3>
                            <p className='mb-4 text-muted-foreground'>Start tracking your supplements and vitamins.</p>
                            <button onClick={() => setShowSupplementForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Add Your First Supplement
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TODO: Add other tabs (diet, workouts, goals) */}
            {activeTab === 'diet' && (
                <div className='py-12 text-center'>
                    <Apple className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                    <h3 className='mb-2 text-lg font-semibold'>Diet Tracking</h3>
                    <p className='text-muted-foreground'>Full diet tracking interface will be implemented here.</p>
                </div>
            )}

            {activeTab === 'workouts' && (
                <div className='py-12 text-center'>
                    <TrendingUp className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                    <h3 className='mb-2 text-lg font-semibold'>Workout Tracking</h3>
                    <p className='text-muted-foreground'>Full workout tracking interface will be implemented here.</p>
                </div>
            )}

            {activeTab === 'goals' && (
                <div className='py-12 text-center'>
                    <Target className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                    <h3 className='mb-2 text-lg font-semibold'>Health Goals</h3>
                    <p className='text-muted-foreground'>Goal setting and tracking interface will be implemented here.</p>
                </div>
            )}

            {/* TODO: Add forms for supplements, meals, workouts */}
            {showSupplementForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>Add Supplement</h3>
                        <p className='mb-4 text-muted-foreground'>Supplement form will be implemented here.</p>
                        <div className='flex gap-2'>
                            <button onClick={() => setShowSupplementForm(false)} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
