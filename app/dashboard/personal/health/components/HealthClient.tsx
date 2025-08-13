'use client';

import React, { useState, useEffect } from 'react';
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

    // New state for template/reference data
    const [dietPlanItems, setDietPlanItems] = useState<any[]>([]);
    const [workoutRoutines, setWorkoutRoutines] = useState<any[]>([]);
    const [healthGoals, setHealthGoals] = useState<any[]>([]);
    const [nutritionGuidelines, setNutritionGuidelines] = useState<any>(null);
    const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
    const [workoutNotes, setWorkoutNotes] = useState<any>(null);
    const [lifestyleGoals, setLifestyleGoals] = useState<any[]>([]);
    const [currentFocus, setCurrentFocus] = useState<any>(null);

    const [showSupplementForm, setShowSupplementForm] = useState(false);
    const [showMealForm, setShowMealForm] = useState(false);
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);
    const [showDietPlanForm, setShowDietPlanForm] = useState(false);
    const [showWorkoutRoutineForm, setShowWorkoutRoutineForm] = useState(false);
    const [showHealthGoalForm, setShowHealthGoalForm] = useState(false);
    const [showNutritionGuidelinesForm, setShowNutritionGuidelinesForm] = useState(false);
    const [showWeeklyScheduleForm, setShowWeeklyScheduleForm] = useState(false);
    const [showWorkoutNotesForm, setShowWorkoutNotesForm] = useState(false);
    const [showLifestyleGoalForm, setShowLifestyleGoalForm] = useState(false);
    const [showCurrentFocusForm, setShowCurrentFocusForm] = useState(false);

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

    const [dietPlanForm, setDietPlanForm] = useState({
        meal_type: 'breakfast',
        name: '',
        description: '',
        ingredients: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        notes: '',
    });

    const [workoutRoutineForm, setWorkoutRoutineForm] = useState({
        name: '',
        description: '',
        muscle_groups: [] as string[],
        day_of_week: '',
        notes: '',
    });

    const [healthGoalForm, setHealthGoalForm] = useState({
        category: 'fitness',
        title: '',
        description: '',
        current_value: '',
        target_value: '',
        status: 'active',
        priority: 2,
        target_date: '',
        notes: '',
    });

    const [nutritionGuidelinesForm, setNutritionGuidelinesForm] = useState({
        daily_calories: '',
        protein_target: '',
        carbs_target: '',
        fat_target: '',
        water_target: '',
        notes: '',
    });

    const [weeklyScheduleForm, setWeeklyScheduleForm] = useState({
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
    });

    const [workoutNotesForm, setWorkoutNotesForm] = useState({
        current_focus: '',
        rest_times: '',
        progression: '',
        general_notes: '',
    });

    const [lifestyleGoalForm, setLifestyleGoalForm] = useState({
        title: '',
        description: '',
        status: 'active',
        target_value: '',
        notes: '',
    });

    const [currentFocusForm, setCurrentFocusForm] = useState({
        period: '',
        title: '',
        description: '',
        key_metrics: {},
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

    // Fetch template/reference data on component mount
    useEffect(() => {
        const fetchTemplateData = async () => {
            try {
                // Fetch diet plan items
                const dietResponse = await fetch('/api/diet-plan-items');
                if (dietResponse.ok) {
                    const dietData = await dietResponse.json();
                    setDietPlanItems(dietData);
                }

                // Fetch workout routines
                const workoutResponse = await fetch('/api/workout-routines');
                if (workoutResponse.ok) {
                    const workoutData = await workoutResponse.json();
                    setWorkoutRoutines(workoutData);
                }

                // Fetch health goals
                const goalsResponse = await fetch('/api/health-goals');
                if (goalsResponse.ok) {
                    const goalsData = await goalsResponse.json();
                    // Separate fitness goals from lifestyle goals
                    setHealthGoals(goalsData.filter((goal: any) => goal.category !== 'lifestyle'));
                    setLifestyleGoals(goalsData.filter((goal: any) => goal.category === 'lifestyle'));
                }

                // Fetch nutrition guidelines
                const nutritionResponse = await fetch('/api/nutrition-guidelines');
                if (nutritionResponse.ok) {
                    const nutritionData = await nutritionResponse.json();
                    setNutritionGuidelines(nutritionData);
                }

                // Fetch weekly schedule
                const scheduleResponse = await fetch('/api/weekly-schedule');
                if (scheduleResponse.ok) {
                    const scheduleData = await scheduleResponse.json();
                    setWeeklySchedule(scheduleData);
                }

                // Fetch workout notes
                const notesResponse = await fetch('/api/workout-notes');
                if (notesResponse.ok) {
                    const notesData = await notesResponse.json();
                    setWorkoutNotes(notesData);
                }

                // Fetch current focus
                const focusResponse = await fetch('/api/current-focus');
                if (focusResponse.ok) {
                    const focusData = await focusResponse.json();
                    setCurrentFocus(focusData);
                }
            } catch (error) {
                console.error('Error fetching template data:', error);
            }
        };

        fetchTemplateData();
    }, []);

    // Add functions (will call APIs)
    const addSupplement = async () => {
        if (!supplementForm.name.trim()) return;

        try {
            const response = await fetch('/api/supplements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplementForm),
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
            const response = await fetch('/api/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...mealForm,
                    calories: mealForm.calories ? parseFloat(mealForm.calories) : null,
                    protein: mealForm.protein ? parseFloat(mealForm.protein) : null,
                    carbs: mealForm.carbs ? parseFloat(mealForm.carbs) : null,
                    fats: mealForm.fats ? parseFloat(mealForm.fats) : null,
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
            const response = await fetch(`/api/supplements/${id}`, {
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
            const response = await fetch(`/api/supplements/${id}`, {
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

    // Diet Plan functions
    const addDietPlanItem = async () => {
        if (!dietPlanForm.name.trim()) return;

        try {
            const response = await fetch('/api/diet-plan-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...dietPlanForm,
                    calories: dietPlanForm.calories ? parseInt(dietPlanForm.calories) : null,
                    protein: dietPlanForm.protein ? parseFloat(dietPlanForm.protein) : null,
                    carbs: dietPlanForm.carbs ? parseFloat(dietPlanForm.carbs) : null,
                    fats: dietPlanForm.fats ? parseFloat(dietPlanForm.fats) : null,
                }),
            });

            if (!response.ok) throw new Error('Failed to add diet plan item');

            const newDietItem = await response.json();
            setDietPlanItems((prev) => [...prev, newDietItem]);
            resetDietPlanForm();
        } catch (error) {
            console.error('Error adding diet plan item:', error);
        }
    };

    const resetDietPlanForm = () => {
        setDietPlanForm({
            meal_type: 'breakfast',
            name: '',
            description: '',
            ingredients: '',
            calories: '',
            protein: '',
            carbs: '',
            fats: '',
            notes: '',
        });
        setShowDietPlanForm(false);
        setEditingDietItem(null);
    };

    const [editingDietItem, setEditingDietItem] = useState<any>(null);

    const editDietPlanItem = (item: any) => {
        setDietPlanForm({
            meal_type: item.meal_type,
            name: item.name,
            description: item.description || '',
            ingredients: item.ingredients || '',
            calories: item.calories?.toString() || '',
            protein: item.protein?.toString() || '',
            carbs: item.carbs?.toString() || '',
            fats: item.fats?.toString() || '',
            notes: item.notes || '',
        });
        setEditingDietItem(item);
        setShowDietPlanForm(true);
    };

    const deleteDietPlanItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this meal option?')) return;

        try {
            const response = await fetch(`/api/diet-plan-items/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete diet plan item');

            setDietPlanItems((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error('Error deleting diet plan item:', error);
        }
    };

    const updateDietPlanItem = async () => {
        if (!dietPlanForm.name.trim() || !editingDietItem) return;

        try {
            const response = await fetch(`/api/diet-plan-items/${editingDietItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...dietPlanForm,
                    calories: dietPlanForm.calories ? parseInt(dietPlanForm.calories) : null,
                    protein: dietPlanForm.protein ? parseFloat(dietPlanForm.protein) : null,
                    carbs: dietPlanForm.carbs ? parseFloat(dietPlanForm.carbs) : null,
                    fats: dietPlanForm.fats ? parseFloat(dietPlanForm.fats) : null,
                }),
            });

            if (!response.ok) throw new Error('Failed to update diet plan item');

            const updatedItem = await response.json();
            setDietPlanItems((prev) => prev.map((item) => (item.id === editingDietItem.id ? updatedItem : item)));
            resetDietPlanForm();
        } catch (error) {
            console.error('Error updating diet plan item:', error);
        }
    };

    // Workout Routine functions
    const addWorkoutRoutine = async () => {
        if (!workoutRoutineForm.name.trim()) return;

        try {
            const response = await fetch('/api/workout-routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...workoutRoutineForm,
                    day_of_week: workoutRoutineForm.day_of_week ? parseInt(workoutRoutineForm.day_of_week) : null,
                }),
            });

            if (!response.ok) throw new Error('Failed to add workout routine');

            const newRoutine = await response.json();
            setWorkoutRoutines((prev) => [...prev, newRoutine]);
            resetWorkoutRoutineForm();
        } catch (error) {
            console.error('Error adding workout routine:', error);
        }
    };

    const resetWorkoutRoutineForm = () => {
        setWorkoutRoutineForm({
            name: '',
            description: '',
            muscle_groups: [],
            day_of_week: '',
            notes: '',
        });
        setShowWorkoutRoutineForm(false);
        setEditingWorkoutRoutine(null);
    };

    const [editingWorkoutRoutine, setEditingWorkoutRoutine] = useState<any>(null);

    const editWorkoutRoutine = (routine: any) => {
        setWorkoutRoutineForm({
            name: routine.name,
            description: routine.description || '',
            muscle_groups: routine.muscle_groups || [],
            day_of_week: routine.day_of_week?.toString() || '',
            notes: routine.notes || '',
        });
        setEditingWorkoutRoutine(routine);
        setShowWorkoutRoutineForm(true);
    };

    const deleteWorkoutRoutine = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workout routine?')) return;

        try {
            const response = await fetch(`/api/workout-routines/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete workout routine');

            setWorkoutRoutines((prev) => prev.filter((routine) => routine.id !== id));
        } catch (error) {
            console.error('Error deleting workout routine:', error);
        }
    };

    const updateWorkoutRoutine = async () => {
        if (!workoutRoutineForm.name.trim() || !editingWorkoutRoutine) return;

        try {
            const response = await fetch(`/api/workout-routines/${editingWorkoutRoutine.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...workoutRoutineForm,
                    day_of_week: workoutRoutineForm.day_of_week ? parseInt(workoutRoutineForm.day_of_week) : null,
                }),
            });

            if (!response.ok) throw new Error('Failed to update workout routine');

            const updatedRoutine = await response.json();
            setWorkoutRoutines((prev) => prev.map((routine) => (routine.id === editingWorkoutRoutine.id ? updatedRoutine : routine)));
            resetWorkoutRoutineForm();
        } catch (error) {
            console.error('Error updating workout routine:', error);
        }
    };

    // Health Goals functions
    const addHealthGoal = async () => {
        if (!healthGoalForm.title.trim()) return;

        try {
            const response = await fetch('/api/health-goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...healthGoalForm,
                    priority: parseInt(healthGoalForm.priority.toString()),
                }),
            });

            if (!response.ok) throw new Error('Failed to add health goal');

            const newGoal = await response.json();
            setHealthGoals((prev) => [...prev, newGoal]);
            resetHealthGoalForm();
        } catch (error) {
            console.error('Error adding health goal:', error);
        }
    };

    const resetHealthGoalForm = () => {
        setHealthGoalForm({
            category: 'fitness',
            title: '',
            description: '',
            current_value: '',
            target_value: '',
            status: 'active',
            priority: 2,
            target_date: '',
            notes: '',
        });
        setShowHealthGoalForm(false);
        setEditingHealthGoal(null);
    };

    const [editingHealthGoal, setEditingHealthGoal] = useState<any>(null);

    const editHealthGoal = (goal: any) => {
        setHealthGoalForm({
            category: goal.category,
            title: goal.title,
            description: goal.description || '',
            current_value: goal.current_value || '',
            target_value: goal.target_value || '',
            status: goal.status,
            priority: goal.priority,
            target_date: goal.target_date || '',
            notes: goal.notes || '',
        });
        setEditingHealthGoal(goal);
        setShowHealthGoalForm(true);
    };

    const deleteHealthGoal = async (id: string) => {
        if (!confirm('Are you sure you want to delete this health goal?')) return;

        try {
            const response = await fetch(`/api/health-goals/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete health goal');

            setHealthGoals((prev) => prev.filter((goal) => goal.id !== id));
        } catch (error) {
            console.error('Error deleting health goal:', error);
        }
    };

    const updateHealthGoal = async () => {
        if (!healthGoalForm.title.trim() || !editingHealthGoal) return;

        try {
            const response = await fetch(`/api/health-goals/${editingHealthGoal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...healthGoalForm,
                    priority: parseInt(healthGoalForm.priority.toString()),
                }),
            });

            if (!response.ok) throw new Error('Failed to update health goal');

            const updatedGoal = await response.json();
            setHealthGoals((prev) => prev.map((goal) => (goal.id === editingHealthGoal.id ? updatedGoal : goal)));
            resetHealthGoalForm();
        } catch (error) {
            console.error('Error updating health goal:', error);
        }
    };

    // Nutrition Guidelines functions
    const addOrUpdateNutritionGuidelines = async () => {
        try {
            const method = nutritionGuidelines ? 'PATCH' : 'POST';
            const url = nutritionGuidelines ? `/api/nutrition-guidelines/${nutritionGuidelines.id}` : '/api/nutrition-guidelines';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    daily_calories: nutritionGuidelinesForm.daily_calories ? parseInt(nutritionGuidelinesForm.daily_calories) : null,
                    protein_target: nutritionGuidelinesForm.protein_target ? parseFloat(nutritionGuidelinesForm.protein_target) : null,
                    carbs_target: nutritionGuidelinesForm.carbs_target ? parseFloat(nutritionGuidelinesForm.carbs_target) : null,
                    fat_target: nutritionGuidelinesForm.fat_target ? parseFloat(nutritionGuidelinesForm.fat_target) : null,
                    water_target: nutritionGuidelinesForm.water_target ? parseFloat(nutritionGuidelinesForm.water_target) : null,
                    notes: nutritionGuidelinesForm.notes || null,
                }),
            });

            if (!response.ok) throw new Error('Failed to save nutrition guidelines');

            const updatedGuidelines = await response.json();
            setNutritionGuidelines(updatedGuidelines);
            resetNutritionGuidelinesForm();
        } catch (error) {
            console.error('Error saving nutrition guidelines:', error);
        }
    };

    const resetNutritionGuidelinesForm = () => {
        setNutritionGuidelinesForm({
            daily_calories: '',
            protein_target: '',
            carbs_target: '',
            fat_target: '',
            water_target: '',
            notes: '',
        });
        setShowNutritionGuidelinesForm(false);
    };

    const editNutritionGuidelines = () => {
        if (nutritionGuidelines) {
            setNutritionGuidelinesForm({
                daily_calories: nutritionGuidelines.daily_calories?.toString() || '',
                protein_target: nutritionGuidelines.protein_target?.toString() || '',
                carbs_target: nutritionGuidelines.carbs_target?.toString() || '',
                fat_target: nutritionGuidelines.fat_target?.toString() || '',
                water_target: nutritionGuidelines.water_target?.toString() || '',
                notes: nutritionGuidelines.notes || '',
            });
        }
        setShowNutritionGuidelinesForm(true);
    };

    // Weekly Schedule & Workout Notes functions
    const addOrUpdateWeeklySchedule = async () => {
        try {
            const method = weeklySchedule ? 'PATCH' : 'POST';
            const url = weeklySchedule ? `/api/weekly-schedule/${weeklySchedule.id}` : '/api/weekly-schedule';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(weeklyScheduleForm),
            });

            if (!response.ok) throw new Error('Failed to save weekly schedule');

            const updatedSchedule = await response.json();
            setWeeklySchedule(updatedSchedule);
            resetWeeklyScheduleForm();
        } catch (error) {
            console.error('Error saving weekly schedule:', error);
        }
    };

    const resetWeeklyScheduleForm = () => {
        setWeeklyScheduleForm({
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: '',
        });
        setShowWeeklyScheduleForm(false);
    };

    const editWeeklySchedule = () => {
        if (weeklySchedule) {
            setWeeklyScheduleForm({
                monday: weeklySchedule.monday || '',
                tuesday: weeklySchedule.tuesday || '',
                wednesday: weeklySchedule.wednesday || '',
                thursday: weeklySchedule.thursday || '',
                friday: weeklySchedule.friday || '',
                saturday: weeklySchedule.saturday || '',
                sunday: weeklySchedule.sunday || '',
            });
        }
        setShowWeeklyScheduleForm(true);
    };

    const addOrUpdateWorkoutNotes = async () => {
        try {
            const method = workoutNotes ? 'PATCH' : 'POST';
            const url = workoutNotes ? `/api/workout-notes/${workoutNotes.id}` : '/api/workout-notes';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workoutNotesForm),
            });

            if (!response.ok) throw new Error('Failed to save workout notes');

            const updatedNotes = await response.json();
            setWorkoutNotes(updatedNotes);
            resetWorkoutNotesForm();
        } catch (error) {
            console.error('Error saving workout notes:', error);
        }
    };

    const resetWorkoutNotesForm = () => {
        setWorkoutNotesForm({
            current_focus: '',
            rest_times: '',
            progression: '',
            general_notes: '',
        });
        setShowWorkoutNotesForm(false);
    };

    const editWorkoutNotes = () => {
        if (workoutNotes) {
            setWorkoutNotesForm({
                current_focus: workoutNotes.current_focus || '',
                rest_times: workoutNotes.rest_times || '',
                progression: workoutNotes.progression || '',
                general_notes: workoutNotes.general_notes || '',
            });
        }
        setShowWorkoutNotesForm(true);
    };

    // Lifestyle Goals functions
    const [editingLifestyleGoal, setEditingLifestyleGoal] = useState<any>(null);

    const addLifestyleGoal = async () => {
        if (!lifestyleGoalForm.title.trim()) return;

        try {
            const response = await fetch('/api/health-goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...lifestyleGoalForm,
                    category: 'lifestyle',
                }),
            });

            if (!response.ok) throw new Error('Failed to add lifestyle goal');

            const newGoal = await response.json();
            setLifestyleGoals((prev) => [...prev, newGoal]);
            resetLifestyleGoalForm();
        } catch (error) {
            console.error('Error adding lifestyle goal:', error);
        }
    };

    const editLifestyleGoal = (goal: any) => {
        setLifestyleGoalForm({
            title: goal.title,
            description: goal.description || '',
            status: goal.status,
            target_value: goal.target_value || '',
            notes: goal.notes || '',
        });
        setEditingLifestyleGoal(goal);
        setShowLifestyleGoalForm(true);
    };

    const updateLifestyleGoal = async () => {
        if (!lifestyleGoalForm.title.trim() || !editingLifestyleGoal) return;

        try {
            const response = await fetch(`/api/health-goals/${editingLifestyleGoal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...lifestyleGoalForm,
                    category: 'lifestyle',
                }),
            });

            if (!response.ok) throw new Error('Failed to update lifestyle goal');

            const updatedGoal = await response.json();
            setLifestyleGoals((prev) => prev.map((goal) => (goal.id === editingLifestyleGoal.id ? updatedGoal : goal)));
            resetLifestyleGoalForm();
        } catch (error) {
            console.error('Error updating lifestyle goal:', error);
        }
    };

    const deleteLifestyleGoal = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lifestyle goal?')) return;

        try {
            const response = await fetch(`/api/health-goals/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete lifestyle goal');

            setLifestyleGoals((prev) => prev.filter((goal) => goal.id !== id));
        } catch (error) {
            console.error('Error deleting lifestyle goal:', error);
        }
    };

    const resetLifestyleGoalForm = () => {
        setLifestyleGoalForm({
            title: '',
            description: '',
            status: 'active',
            target_value: '',
            notes: '',
        });
        setShowLifestyleGoalForm(false);
        setEditingLifestyleGoal(null);
    };

    // Current Focus functions
    const addOrUpdateCurrentFocus = async () => {
        try {
            const method = currentFocus ? 'PATCH' : 'POST';
            const url = currentFocus ? `/api/current-focus/${currentFocus.id}` : '/api/current-focus';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentFocusForm),
            });

            if (!response.ok) throw new Error('Failed to save current focus');

            const updatedFocus = await response.json();
            setCurrentFocus(updatedFocus);
            resetCurrentFocusForm();
        } catch (error) {
            console.error('Error saving current focus:', error);
        }
    };

    const resetCurrentFocusForm = () => {
        setCurrentFocusForm({
            period: '',
            title: '',
            description: '',
            key_metrics: {},
        });
        setShowCurrentFocusForm(false);
    };

    const editCurrentFocus = () => {
        if (currentFocus) {
            setCurrentFocusForm({
                period: currentFocus.period || '',
                title: currentFocus.title || '',
                description: currentFocus.description || '',
                key_metrics: currentFocus.key_metrics || {},
            });
        }
        setShowCurrentFocusForm(true);
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

                    {/* Overview Sections - Read Only */}
                    <div className='space-y-6'>
                        {/* Diet Overview */}
                        <div className='rounded-lg border bg-card p-6'>
                            <h3 className='mb-4 text-lg font-semibold'>Diet Plan Overview</h3>
                            <div className='grid gap-4 lg:grid-cols-4'>
                                {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                                    const mealItems = dietPlanItems.filter((item) => item.meal_type === mealType);
                                    return (
                                        <div key={mealType}>
                                            <h4 className='mb-2 text-sm font-medium text-muted-foreground'>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>
                                            <div className='space-y-1'>
                                                {mealItems.slice(0, 3).map((item: any) => (
                                                    <div key={item.id} className='text-sm'>
                                                        <p className='font-medium'>{item.name}</p>
                                                        {item.calories && <span className='text-xs text-muted-foreground'>{item.calories} cal</span>}
                                                    </div>
                                                ))}
                                                {mealItems.length === 0 && <p className='text-sm text-muted-foreground'>No options set</p>}
                                                {mealItems.length > 3 && <p className='text-xs text-muted-foreground'>+{mealItems.length - 3} more</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Workouts Overview */}
                        <div className='rounded-lg border bg-card p-6'>
                            <h3 className='mb-4 text-lg font-semibold'>Workout Routines Overview</h3>
                            {workoutRoutines.length > 0 ? (
                                <div className='grid gap-4 lg:grid-cols-3'>
                                    {workoutRoutines.slice(0, 6).map((routine: any) => (
                                        <div key={routine.id} className='rounded bg-accent/30 p-3'>
                                            <h4 className='font-medium'>{routine.name}</h4>
                                            {routine.muscle_groups && routine.muscle_groups.length > 0 && (
                                                <div className='mt-1 flex flex-wrap gap-1'>
                                                    {routine.muscle_groups.slice(0, 2).map((group: string, index: number) => (
                                                        <span key={index} className='rounded bg-primary/10 px-1 py-0.5 text-xs text-primary'>
                                                            {group}
                                                        </span>
                                                    ))}
                                                    {routine.muscle_groups.length > 2 && <span className='text-xs text-muted-foreground'>+{routine.muscle_groups.length - 2}</span>}
                                                </div>
                                            )}
                                            {routine.workout_exercises && routine.workout_exercises.length > 0 && (
                                                <p className='mt-1 text-xs text-muted-foreground'>{routine.workout_exercises.length} exercises</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className='text-muted-foreground'>No workout routines set</p>
                            )}
                        </div>

                        {/* Goals Overview */}
                        <div className='rounded-lg border bg-card p-6'>
                            <h3 className='mb-4 text-lg font-semibold'>Health Goals Overview</h3>
                            {healthGoals.length > 0 ? (
                                <div className='grid gap-3 lg:grid-cols-2'>
                                    {healthGoals
                                        .filter((goal) => goal.status === 'active' || goal.status === 'in_progress')
                                        .slice(0, 4)
                                        .map((goal: any) => (
                                            <div key={goal.id} className='flex items-start justify-between rounded bg-accent/30 p-3'>
                                                <div className='flex-1'>
                                                    <h4 className='font-medium'>{goal.title}</h4>
                                                    <p className='text-sm text-muted-foreground'>{goal.category}</p>
                                                    {goal.target_value && <p className='text-xs text-muted-foreground'>Target: {goal.target_value}</p>}
                                                </div>
                                                <span
                                                    className={`rounded px-2 py-1 text-xs ${
                                                        goal.status === 'in_progress'
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                                                    }`}>
                                                    {goal.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className='text-muted-foreground'>No health goals set</p>
                            )}
                        </div>

                        {/* Supplements Overview */}
                        <div className='rounded-lg border bg-card p-6'>
                            <h3 className='mb-4 text-lg font-semibold'>Active Supplements</h3>
                            {supplements.filter((s) => s.is_active).length > 0 ? (
                                <div className='grid gap-3 lg:grid-cols-3'>
                                    {supplements
                                        .filter((s) => s.is_active)
                                        .slice(0, 6)
                                        .map((supplement) => (
                                            <div key={supplement.id} className='rounded bg-accent/30 p-3'>
                                                <h4 className='font-medium'>{supplement.name}</h4>
                                                <p className='text-sm text-muted-foreground'>{supplement.dosage}</p>
                                                <p className='text-xs text-muted-foreground'>{supplement.frequency}</p>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className='text-muted-foreground'>No active supplements</p>
                            )}
                        </div>

                        {/* Nutrition Guidelines Overview */}
                        {nutritionGuidelines && (
                            <div className='rounded-lg border bg-card p-6'>
                                <h3 className='mb-4 text-lg font-semibold'>Nutrition Guidelines</h3>
                                <div className='grid gap-4 md:grid-cols-4'>
                                    <div className='text-center'>
                                        <p className='text-xl font-bold text-primary'>{nutritionGuidelines.daily_calories || '—'}</p>
                                        <p className='text-sm text-muted-foreground'>Daily Calories</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-xl font-bold text-primary'>{nutritionGuidelines.protein_target ? `${nutritionGuidelines.protein_target}g` : '—'}</p>
                                        <p className='text-sm text-muted-foreground'>Protein Target</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-xl font-bold text-primary'>{nutritionGuidelines.carbs_target ? `${nutritionGuidelines.carbs_target}g` : '—'}</p>
                                        <p className='text-sm text-muted-foreground'>Carbs Target</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-xl font-bold text-primary'>{nutritionGuidelines.fat_target ? `${nutritionGuidelines.fat_target}g` : '—'}</p>
                                        <p className='text-sm text-muted-foreground'>Fat Target</p>
                                    </div>
                                </div>
                            </div>
                        )}
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

            {activeTab === 'diet' && (
                <div className='space-y-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h2 className='text-xl font-semibold'>My Diet Plan</h2>
                            <p className='text-muted-foreground'>Your preferred meals and eating routine</p>
                        </div>
                        <button
                            onClick={() => setShowDietPlanForm(true)}
                            className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            <Plus className='h-4 w-4' />
                            Add Meal Template
                        </button>
                    </div>

                    {/* Daily Meal Plan */}
                    <div className='grid gap-6 lg:grid-cols-4'>
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                            const mealItems = dietPlanItems.filter((item) => item.meal_type === mealType);
                            const mealColors = {
                                breakfast: 'text-orange-500',
                                lunch: 'text-green-500',
                                dinner: 'text-blue-500',
                                snack: 'text-purple-500',
                            };

                            return (
                                <div key={mealType} className='rounded-lg border bg-card p-6'>
                                    <div className='mb-4 flex items-center gap-2'>
                                        <Apple className={`h-5 w-5 ${mealColors[mealType as keyof typeof mealColors]}`} />
                                        <h3 className='font-semibold'>{mealType.charAt(0).toUpperCase() + mealType.slice(1)} Options</h3>
                                    </div>
                                    <div className='space-y-3'>
                                        {mealItems.map((item: any) => (
                                            <div key={item.id} className='rounded bg-accent/30 p-3'>
                                                <div className='flex items-start justify-between'>
                                                    <div className='flex-1'>
                                                        <p className='font-medium'>{item.name}</p>
                                                        {item.description && <p className='text-sm text-muted-foreground'>{item.description}</p>}
                                                        {(item.calories || item.protein) && (
                                                            <p className='text-xs text-muted-foreground'>
                                                                {item.calories && `${item.calories} cal`}
                                                                {item.calories && item.protein && ' • '}
                                                                {item.protein && `${item.protein}g protein`}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className='ml-2 flex items-center gap-1'>
                                                        <button onClick={() => editDietPlanItem(item)} className='rounded p-1 hover:bg-accent'>
                                                            <Edit3 className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                                                        </button>
                                                        <button onClick={() => deleteDietPlanItem(item.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                                            <Trash2 className='h-3 w-3' />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                setDietPlanForm((prev) => ({ ...prev, meal_type: mealType }));
                                                setShowDietPlanForm(true);
                                            }}
                                            className='w-full rounded border-2 border-dashed border-muted p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary'>
                                            + Add {mealType} option
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Nutrition Guidelines */}
                    <div className='rounded-lg border bg-card p-6'>
                        <h3 className='mb-4 font-semibold'>My Nutrition Guidelines</h3>
                        {nutritionGuidelines ? (
                            <div className='grid gap-4 md:grid-cols-4'>
                                <div className='text-center'>
                                    <p className='text-2xl font-bold text-primary'>{nutritionGuidelines.daily_calories || '—'}</p>
                                    <p className='text-sm text-muted-foreground'>Daily Calories</p>
                                </div>
                                <div className='text-center'>
                                    <p className='text-2xl font-bold text-primary'>{nutritionGuidelines.protein_target ? `${nutritionGuidelines.protein_target}g` : '—'}</p>
                                    <p className='text-sm text-muted-foreground'>Protein Target</p>
                                </div>
                                <div className='text-center'>
                                    <p className='text-2xl font-bold text-primary'>{nutritionGuidelines.carbs_target ? `${nutritionGuidelines.carbs_target}g` : '—'}</p>
                                    <p className='text-sm text-muted-foreground'>Carbs Target</p>
                                </div>
                                <div className='text-center'>
                                    <p className='text-2xl font-bold text-primary'>{nutritionGuidelines.fat_target ? `${nutritionGuidelines.fat_target}g` : '—'}</p>
                                    <p className='text-sm text-muted-foreground'>Fat Target</p>
                                </div>
                            </div>
                        ) : (
                            <div className='py-8 text-center text-muted-foreground'>
                                <p>No nutrition guidelines set yet.</p>
                            </div>
                        )}
                        <div className='mt-4'>
                            <button onClick={editNutritionGuidelines} className='rounded-md border px-4 py-2 text-sm hover:bg-accent'>
                                {nutritionGuidelines ? 'Edit Guidelines' : 'Set Guidelines'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'workouts' && (
                <div className='space-y-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h2 className='text-xl font-semibold'>My Workout Routine</h2>
                            <p className='text-muted-foreground'>Your current workout split and exercise preferences</p>
                        </div>
                        <button
                            onClick={() => setShowWorkoutRoutineForm(true)}
                            className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            <Plus className='h-4 w-4' />
                            Add Workout Template
                        </button>
                    </div>

                    {/* Weekly Split */}
                    {workoutRoutines.length > 0 ? (
                        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {workoutRoutines.map((routine: any) => (
                                <div key={routine.id} className='rounded-lg border bg-card p-6'>
                                    <div className='mb-4 flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <TrendingUp className='h-5 w-5 text-primary' />
                                            <h3 className='font-semibold'>{routine.name}</h3>
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <button onClick={() => editWorkoutRoutine(routine)} className='rounded p-1 hover:bg-accent'>
                                                <Edit3 className='h-4 w-4 text-muted-foreground hover:text-foreground' />
                                            </button>
                                            <button onClick={() => deleteWorkoutRoutine(routine.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                                <Trash2 className='h-4 w-4' />
                                            </button>
                                        </div>
                                    </div>
                                    {routine.description && <p className='mb-3 text-sm text-muted-foreground'>{routine.description}</p>}
                                    {routine.muscle_groups && routine.muscle_groups.length > 0 && (
                                        <div className='mb-3 flex flex-wrap gap-1'>
                                            {routine.muscle_groups.map((group: string, index: number) => (
                                                <span key={index} className='rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                                    {group}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {routine.workout_exercises && routine.workout_exercises.length > 0 && (
                                        <div className='space-y-2'>
                                            {routine.workout_exercises.map((exercise: any) => (
                                                <div key={exercise.id} className='rounded bg-accent/30 p-2'>
                                                    <p className='text-sm font-medium'>{exercise.exercise_name}</p>
                                                    {(exercise.sets || exercise.reps) && (
                                                        <p className='text-xs text-muted-foreground'>
                                                            {exercise.sets && `${exercise.sets} sets`}
                                                            {exercise.sets && exercise.reps && ' × '}
                                                            {exercise.reps && `${exercise.reps} reps`}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {routine.notes && (
                                        <div className='mt-3 rounded bg-accent/30 p-3'>
                                            <p className='text-sm'>{routine.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='py-12 text-center'>
                            <TrendingUp className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                            <h3 className='mb-2 text-lg font-semibold'>No Workout Routines</h3>
                            <p className='mb-4 text-muted-foreground'>Create your workout routine templates.</p>
                            <button onClick={() => setShowWorkoutRoutineForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Add Your First Routine
                            </button>
                        </div>
                    )}

                    <div className='hidden'>
                        {/* Push Day */}
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center gap-2'>
                                <TrendingUp className='h-5 w-5 text-red-500' />
                                <h3 className='font-semibold'>Push Day</h3>
                                <span className='rounded bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300'>Chest, Shoulders, Triceps</span>
                            </div>
                            <div className='space-y-2'>
                                <div className='rounded bg-accent/30 p-2'>
                                    <p className='text-sm font-medium'>Bench Press</p>
                                    <p className='text-xs text-muted-foreground'>4 sets × 8-10 reps</p>
                                </div>
                                <div className='rounded bg-accent/30 p-2'>
                                    <p className='text-sm font-medium'>Overhead Press</p>
                                    <p className='text-xs text-muted-foreground'>3 sets × 8-12 reps</p>
                                </div>
                                <div className='rounded bg-accent/30 p-2'>
                                    <p className='text-sm font-medium'>Dips</p>
                                    <p className='text-xs text-muted-foreground'>3 sets × 10-15 reps</p>
                                </div>
                                <button className='w-full rounded border border-dashed border-muted p-2 text-xs text-muted-foreground hover:border-primary hover:text-primary'>
                                    + Add exercise
                                </button>
                            </div>
                        </div>

                        {/* Pull Day */}
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center gap-2'>
                                <TrendingUp className='h-5 w-5 text-blue-500' />
                                <h3 className='font-semibold'>Pull Day</h3>
                                <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'>Back, Biceps</span>
                            </div>
                            <div className='space-y-2'>
                                <div className='rounded bg-accent/30 p-2'>
                                    <p className='text-sm font-medium'>Pull-ups</p>
                                    <p className='text-xs text-muted-foreground'>4 sets × 6-10 reps</p>
                                </div>
                                <div className='rounded bg-accent/30 p-2'>
                                    <p className='text-sm font-medium'>Rows</p>
                                    <p className='text-xs text-muted-foreground'>4 sets × 8-12 reps</p>
                                </div>
                                <button className='w-full rounded border border-dashed border-muted p-2 text-xs text-muted-foreground hover:border-primary hover:text-primary'>
                                    + Add exercise
                                </button>
                            </div>
                        </div>

                        {/* Legs */}
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center gap-2'>
                                <TrendingUp className='h-5 w-5 text-green-500' />
                                <h3 className='font-semibold'>Leg Day</h3>
                                <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-300'>Quads, Glutes, Hams</span>
                            </div>
                            <div className='space-y-2'>
                                <div className='rounded bg-accent/30 p-2'>
                                    <p className='text-sm font-medium'>Squats</p>
                                    <p className='text-xs text-muted-foreground'>4 sets × 8-12 reps</p>
                                </div>
                                <div className='rounded bg-accent/30 p-2'>
                                    <p className='text-sm font-medium'>Deadlifts</p>
                                    <p className='text-xs text-muted-foreground'>3 sets × 5-8 reps</p>
                                </div>
                                <button className='w-full rounded border border-dashed border-muted p-2 text-xs text-muted-foreground hover:border-primary hover:text-primary'>
                                    + Add exercise
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Notes */}
                    <div className='grid gap-6 lg:grid-cols-2'>
                        <div className='rounded-lg border bg-card p-6'>
                            <h3 className='mb-4 font-semibold'>Weekly Schedule</h3>
                            {weeklySchedule ? (
                                <div className='space-y-2'>
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                        <div key={day} className='flex justify-between'>
                                            <span className='text-sm capitalize'>{day}</span>
                                            <span className='text-sm text-muted-foreground'>{weeklySchedule[day] || 'Rest'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='py-8 text-center text-muted-foreground'>
                                    <p>No weekly schedule set yet.</p>
                                </div>
                            )}
                            <div className='mt-4'>
                                <button onClick={editWeeklySchedule} className='rounded-md border px-4 py-2 text-sm hover:bg-accent'>
                                    {weeklySchedule ? 'Edit Schedule' : 'Set Schedule'}
                                </button>
                            </div>
                        </div>

                        <div className='rounded-lg border bg-card p-6'>
                            <h3 className='mb-4 font-semibold'>Workout Notes</h3>
                            {workoutNotes ? (
                                <div className='space-y-3 text-sm text-muted-foreground'>
                                    {workoutNotes.current_focus && (
                                        <div className='rounded bg-accent/30 p-3'>
                                            <p className='font-medium text-foreground'>Current Focus</p>
                                            <p>{workoutNotes.current_focus}</p>
                                        </div>
                                    )}
                                    {workoutNotes.rest_times && (
                                        <div className='rounded bg-accent/30 p-3'>
                                            <p className='font-medium text-foreground'>Rest Times</p>
                                            <p>{workoutNotes.rest_times}</p>
                                        </div>
                                    )}
                                    {workoutNotes.progression && (
                                        <div className='rounded bg-accent/30 p-3'>
                                            <p className='font-medium text-foreground'>Progression</p>
                                            <p>{workoutNotes.progression}</p>
                                        </div>
                                    )}
                                    {workoutNotes.general_notes && (
                                        <div className='rounded bg-accent/30 p-3'>
                                            <p className='font-medium text-foreground'>General Notes</p>
                                            <p>{workoutNotes.general_notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='py-8 text-center text-muted-foreground'>
                                    <p>No workout notes set yet.</p>
                                </div>
                            )}
                            <div className='mt-4'>
                                <button onClick={editWorkoutNotes} className='rounded-md border px-4 py-2 text-sm hover:bg-accent'>
                                    {workoutNotes ? 'Edit Notes' : 'Add Notes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'goals' && (
                <div className='space-y-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h2 className='text-xl font-semibold'>My Health Goals</h2>
                            <p className='text-muted-foreground'>Current objectives and focus areas</p>
                        </div>
                        <button
                            onClick={() => setShowHealthGoalForm(true)}
                            className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            <Plus className='h-4 w-4' />
                            Add Goal
                        </button>
                    </div>

                    {/* Primary Goals */}
                    {healthGoals.length > 0 ? (
                        <div className='grid gap-4 lg:grid-cols-2'>
                            {healthGoals.map((goal: any) => (
                                <div key={goal.id} className='rounded-lg border bg-card p-6'>
                                    <div className='mb-4 flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <h3 className='font-semibold'>{goal.title}</h3>
                                            <span className='text-sm text-muted-foreground'>{goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <button onClick={() => editHealthGoal(goal)} className='rounded p-1 hover:bg-accent'>
                                                <Edit3 className='h-4 w-4 text-muted-foreground hover:text-foreground' />
                                            </button>
                                            <button onClick={() => deleteHealthGoal(goal.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                                <Trash2 className='h-4 w-4' />
                                            </button>
                                            <span
                                                className={`rounded px-2 py-1 text-xs ${
                                                    goal.status === 'completed'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                        : goal.status === 'in_progress'
                                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                                                }`}>
                                                {goal.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {goal.description && <p className='mb-3 text-sm text-muted-foreground'>{goal.description}</p>}

                                    {(goal.current_value || goal.target_value) && (
                                        <div className='mb-3 space-y-1'>
                                            {goal.current_value && (
                                                <p className='text-sm'>
                                                    <span className='font-medium'>Current:</span> {goal.current_value}
                                                </p>
                                            )}
                                            {goal.target_value && (
                                                <p className='text-sm'>
                                                    <span className='font-medium'>Target:</span> {goal.target_value}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {goal.target_date && (
                                        <p className='text-sm text-muted-foreground'>
                                            <span className='font-medium'>Target Date:</span> {new Date(goal.target_date).toLocaleDateString()}
                                        </p>
                                    )}

                                    {goal.notes && (
                                        <div className='mt-3 rounded bg-accent/30 p-3'>
                                            <p className='text-sm'>{goal.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='py-12 text-center'>
                            <Target className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                            <h3 className='mb-2 text-lg font-semibold'>No Health Goals</h3>
                            <p className='mb-4 text-muted-foreground'>Set your health and fitness objectives.</p>
                            <button onClick={() => setShowHealthGoalForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Add Your First Goal
                            </button>
                        </div>
                    )}

                    <div className='hidden'>
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center gap-2'>
                                <Target className='h-5 w-5 text-blue-500' />
                                <h3 className='font-semibold'>Fitness Goals</h3>
                            </div>
                            <div className='space-y-3'>
                                <div className='rounded bg-accent/30 p-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='font-medium'>Increase Bench Press</p>
                                            <p className='text-sm text-muted-foreground'>Current: 185 lbs → Target: 225 lbs</p>
                                        </div>
                                        <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'>In Progress</span>
                                    </div>
                                </div>
                                <div className='rounded bg-accent/30 p-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='font-medium'>Run 5K Under 25 Minutes</p>
                                            <p className='text-sm text-muted-foreground'>Current: 28:30 → Target: 24:59</p>
                                        </div>
                                        <span className='rounded bg-orange-100 px-2 py-1 text-xs text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'>On Hold</span>
                                    </div>
                                </div>
                                <button className='w-full rounded border-2 border-dashed border-muted p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary'>
                                    + Add fitness goal
                                </button>
                            </div>
                        </div>

                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center gap-2'>
                                <Apple className='h-5 w-5 text-green-500' />
                                <h3 className='font-semibold'>Nutrition Goals</h3>
                            </div>
                            <div className='space-y-3'>
                                <div className='rounded bg-accent/30 p-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='font-medium'>Daily Protein Target</p>
                                            <p className='text-sm text-muted-foreground'>150g protein per day</p>
                                        </div>
                                        <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-300'>Active</span>
                                    </div>
                                </div>
                                <div className='rounded bg-accent/30 p-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='font-medium'>Reduce Sugar Intake</p>
                                            <p className='text-sm text-muted-foreground'>Limit processed foods & desserts</p>
                                        </div>
                                        <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'>In Progress</span>
                                    </div>
                                </div>
                                <button className='w-full rounded border-2 border-dashed border-muted p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary'>
                                    + Add nutrition goal
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lifestyle & Health */}
                    <div className='grid gap-6 lg:grid-cols-2'>
                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Clock className='h-5 w-5 text-purple-500' />
                                    <h3 className='font-semibold'>Lifestyle Goals</h3>
                                </div>
                                <button onClick={() => setShowLifestyleGoalForm(true)} className='rounded p-1 hover:bg-accent'>
                                    <Plus className='h-4 w-4 text-primary' />
                                </button>
                            </div>
                            <div className='space-y-3'>
                                {lifestyleGoals.length > 0 ? (
                                    lifestyleGoals.map((goal: any) => (
                                        <div key={goal.id} className='rounded bg-accent/30 p-3'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex-1'>
                                                    <p className='font-medium'>{goal.title}</p>
                                                    {goal.description && <p className='text-sm text-muted-foreground'>{goal.description}</p>}
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs ${
                                                            goal.status === 'completed'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                                : goal.status === 'in_progress'
                                                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                                                        }`}>
                                                        {goal.status.replace('_', ' ')}
                                                    </span>
                                                    <button onClick={() => editLifestyleGoal(goal)} className='rounded p-1 hover:bg-accent'>
                                                        <Edit3 className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                                                    </button>
                                                    <button onClick={() => deleteLifestyleGoal(goal.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                                        <Trash2 className='h-3 w-3' />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='py-8 text-center text-muted-foreground'>
                                        <p>No lifestyle goals set yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='rounded-lg border bg-card p-6'>
                            <div className='mb-4 flex items-center justify-between'>
                                <h3 className='font-semibold'>Current Focus</h3>
                                <button onClick={() => setShowCurrentFocusForm(true)} className='rounded p-1 hover:bg-accent'>
                                    {currentFocus ? <Edit3 className='h-4 w-4 text-muted-foreground hover:text-foreground' /> : <Plus className='h-4 w-4 text-primary' />}
                                </button>
                            </div>
                            {currentFocus ? (
                                <div className='space-y-3'>
                                    <div className='rounded border border-primary/20 bg-primary/10 p-4'>
                                        <div className='mb-2 flex items-center gap-2'>
                                            <Target className='h-4 w-4 text-primary' />
                                            <p className='font-medium text-primary'>{currentFocus.title}</p>
                                        </div>
                                        <p className='text-sm'>{currentFocus.description}</p>
                                    </div>
                                    {currentFocus.key_metrics && Object.keys(currentFocus.key_metrics).length > 0 && (
                                        <div className='space-y-2 text-sm'>
                                            {Object.entries(currentFocus.key_metrics).map(([key, value]: [string, any]) => (
                                                <div key={key} className='flex justify-between'>
                                                    <span className='capitalize'>{key.replace('_', ' ')}</span>
                                                    <span className='text-muted-foreground'>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className='mt-4'>
                                        <button onClick={() => setShowCurrentFocusForm(true)} className='rounded-md border px-4 py-2 text-sm hover:bg-accent'>
                                            Update Focus
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className='py-8 text-center text-muted-foreground'>
                                    <p>No current focus set yet.</p>
                                    <button
                                        onClick={() => setShowCurrentFocusForm(true)}
                                        className='mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                        Set Current Focus
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Supplement Form Modal */}
            {showSupplementForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>Add Supplement</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Name</label>
                                <input
                                    type='text'
                                    value={supplementForm.name}
                                    onChange={(e) => setSupplementForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder='e.g., Vitamin D3'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Dosage</label>
                                <input
                                    type='text'
                                    value={supplementForm.dosage}
                                    onChange={(e) => setSupplementForm((prev) => ({ ...prev, dosage: e.target.value }))}
                                    placeholder='e.g., 1000 IU'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Frequency</label>
                                <select
                                    value={supplementForm.frequency}
                                    onChange={(e) => setSupplementForm((prev) => ({ ...prev, frequency: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value=''>Select frequency</option>
                                    <option value='daily'>Daily</option>
                                    <option value='twice daily'>Twice Daily</option>
                                    <option value='weekly'>Weekly</option>
                                    <option value='as needed'>As Needed</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Notes</label>
                                <textarea
                                    value={supplementForm.notes}
                                    onChange={(e) => setSupplementForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder='Any additional notes...'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetSupplementForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={addSupplement} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Meal Form Modal */}
            {showMealForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>Add Meal</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Meal Name</label>
                                <input
                                    type='text'
                                    value={mealForm.name}
                                    onChange={(e) => setMealForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder='e.g., Breakfast'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-medium'>Date</label>
                                    <input
                                        type='date'
                                        value={mealForm.meal_date}
                                        onChange={(e) => setMealForm((prev) => ({ ...prev, meal_date: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                                <div>
                                    <label className='text-sm font-medium'>Time</label>
                                    <input
                                        type='time'
                                        value={mealForm.meal_time}
                                        onChange={(e) => setMealForm((prev) => ({ ...prev, meal_time: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-medium'>Calories</label>
                                    <input
                                        type='number'
                                        value={mealForm.calories}
                                        onChange={(e) => setMealForm((prev) => ({ ...prev, calories: e.target.value }))}
                                        placeholder='0'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                                <div>
                                    <label className='text-sm font-medium'>Protein (g)</label>
                                    <input
                                        type='number'
                                        value={mealForm.protein}
                                        onChange={(e) => setMealForm((prev) => ({ ...prev, protein: e.target.value }))}
                                        placeholder='0'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-medium'>Carbs (g)</label>
                                    <input
                                        type='number'
                                        value={mealForm.carbs}
                                        onChange={(e) => setMealForm((prev) => ({ ...prev, carbs: e.target.value }))}
                                        placeholder='0'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                                <div>
                                    <label className='text-sm font-medium'>Fats (g)</label>
                                    <input
                                        type='number'
                                        value={mealForm.fats}
                                        onChange={(e) => setMealForm((prev) => ({ ...prev, fats: e.target.value }))}
                                        placeholder='0'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetMealForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={addMeal} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Diet Plan Form Modal */}
            {showDietPlanForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{editingDietItem ? 'Edit Meal Template' : 'Add Meal Template'}</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Meal Type</label>
                                <select
                                    value={dietPlanForm.meal_type}
                                    onChange={(e) => setDietPlanForm((prev) => ({ ...prev, meal_type: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value='breakfast'>Breakfast</option>
                                    <option value='lunch'>Lunch</option>
                                    <option value='dinner'>Dinner</option>
                                    <option value='snack'>Snack</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Name</label>
                                <input
                                    type='text'
                                    value={dietPlanForm.name}
                                    onChange={(e) => setDietPlanForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder='Meal name'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Description</label>
                                <input
                                    type='text'
                                    value={dietPlanForm.description}
                                    onChange={(e) => setDietPlanForm((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder='Brief description'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-medium'>Calories</label>
                                    <input
                                        type='number'
                                        value={dietPlanForm.calories}
                                        onChange={(e) => setDietPlanForm((prev) => ({ ...prev, calories: e.target.value }))}
                                        placeholder='0'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                                <div>
                                    <label className='text-sm font-medium'>Protein (g)</label>
                                    <input
                                        type='number'
                                        value={dietPlanForm.protein}
                                        onChange={(e) => setDietPlanForm((prev) => ({ ...prev, protein: e.target.value }))}
                                        placeholder='0'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetDietPlanForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button
                                onClick={editingDietItem ? updateDietPlanItem : addDietPlanItem}
                                className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {editingDietItem ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Workout Routine Form Modal */}
            {showWorkoutRoutineForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{editingWorkoutRoutine ? 'Edit Workout Routine' : 'Add Workout Routine'}</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Name</label>
                                <input
                                    type='text'
                                    value={workoutRoutineForm.name}
                                    onChange={(e) => setWorkoutRoutineForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder='e.g., Push Day, Pull Day'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Description</label>
                                <input
                                    type='text'
                                    value={workoutRoutineForm.description}
                                    onChange={(e) => setWorkoutRoutineForm((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder='Brief description'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Day of Week (optional)</label>
                                <select
                                    value={workoutRoutineForm.day_of_week}
                                    onChange={(e) => setWorkoutRoutineForm((prev) => ({ ...prev, day_of_week: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value=''>Select day (optional)</option>
                                    <option value='0'>Sunday</option>
                                    <option value='1'>Monday</option>
                                    <option value='2'>Tuesday</option>
                                    <option value='3'>Wednesday</option>
                                    <option value='4'>Thursday</option>
                                    <option value='5'>Friday</option>
                                    <option value='6'>Saturday</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Notes</label>
                                <textarea
                                    value={workoutRoutineForm.notes}
                                    onChange={(e) => setWorkoutRoutineForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder='Any additional notes...'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetWorkoutRoutineForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button
                                onClick={editingWorkoutRoutine ? updateWorkoutRoutine : addWorkoutRoutine}
                                className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {editingWorkoutRoutine ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Health Goal Form Modal */}
            {showHealthGoalForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{editingHealthGoal ? 'Edit Health Goal' : 'Add Health Goal'}</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Category</label>
                                <select
                                    value={healthGoalForm.category}
                                    onChange={(e) => setHealthGoalForm((prev) => ({ ...prev, category: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value='fitness'>Fitness</option>
                                    <option value='nutrition'>Nutrition</option>
                                    <option value='lifestyle'>Lifestyle</option>
                                    <option value='general'>General</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Title</label>
                                <input
                                    type='text'
                                    value={healthGoalForm.title}
                                    onChange={(e) => setHealthGoalForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder='Goal title'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Target Value (optional)</label>
                                <input
                                    type='text'
                                    value={healthGoalForm.target_value}
                                    onChange={(e) => setHealthGoalForm((prev) => ({ ...prev, target_value: e.target.value }))}
                                    placeholder='e.g., 180 lbs, 10% body fat'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Priority</label>
                                <select
                                    value={healthGoalForm.priority}
                                    onChange={(e) => setHealthGoalForm((prev) => ({ ...prev, priority: parseInt(e.target.value) }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value={1}>High</option>
                                    <option value={2}>Medium</option>
                                    <option value={3}>Low</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Target Date (optional)</label>
                                <input
                                    type='date'
                                    value={healthGoalForm.target_date}
                                    onChange={(e) => setHealthGoalForm((prev) => ({ ...prev, target_date: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetHealthGoalForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button
                                onClick={editingHealthGoal ? updateHealthGoal : addHealthGoal}
                                className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {editingHealthGoal ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Nutrition Guidelines Form Modal */}
            {showNutritionGuidelinesForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{nutritionGuidelines ? 'Edit Nutrition Guidelines' : 'Set Nutrition Guidelines'}</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Daily Calories</label>
                                <input
                                    type='number'
                                    value={nutritionGuidelinesForm.daily_calories}
                                    onChange={(e) => setNutritionGuidelinesForm((prev) => ({ ...prev, daily_calories: e.target.value }))}
                                    placeholder='2200'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-medium'>Protein Target (g)</label>
                                    <input
                                        type='number'
                                        value={nutritionGuidelinesForm.protein_target}
                                        onChange={(e) => setNutritionGuidelinesForm((prev) => ({ ...prev, protein_target: e.target.value }))}
                                        placeholder='150'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                                <div>
                                    <label className='text-sm font-medium'>Carbs Target (g)</label>
                                    <input
                                        type='number'
                                        value={nutritionGuidelinesForm.carbs_target}
                                        onChange={(e) => setNutritionGuidelinesForm((prev) => ({ ...prev, carbs_target: e.target.value }))}
                                        placeholder='250'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-medium'>Fat Target (g)</label>
                                    <input
                                        type='number'
                                        value={nutritionGuidelinesForm.fat_target}
                                        onChange={(e) => setNutritionGuidelinesForm((prev) => ({ ...prev, fat_target: e.target.value }))}
                                        placeholder='80'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                                <div>
                                    <label className='text-sm font-medium'>Water Target (L)</label>
                                    <input
                                        type='number'
                                        step='0.1'
                                        value={nutritionGuidelinesForm.water_target}
                                        onChange={(e) => setNutritionGuidelinesForm((prev) => ({ ...prev, water_target: e.target.value }))}
                                        placeholder='3.5'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Notes (optional)</label>
                                <textarea
                                    value={nutritionGuidelinesForm.notes}
                                    onChange={(e) => setNutritionGuidelinesForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder='Any additional notes about your nutrition plan...'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetNutritionGuidelinesForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={addOrUpdateNutritionGuidelines} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {nutritionGuidelines ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Weekly Schedule Form Modal */}
            {showWeeklyScheduleForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-lg rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{weeklySchedule ? 'Edit Weekly Schedule' : 'Set Weekly Schedule'}</h3>
                        <div className='space-y-4'>
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                <div key={day}>
                                    <label className='text-sm font-medium capitalize'>{day}</label>
                                    <input
                                        type='text'
                                        value={weeklyScheduleForm[day as keyof typeof weeklyScheduleForm]}
                                        onChange={(e) => setWeeklyScheduleForm((prev) => ({ ...prev, [day]: e.target.value }))}
                                        placeholder='e.g., Push Day, Pull Day, Legs, Rest'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            ))}
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetWeeklyScheduleForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={addOrUpdateWeeklySchedule} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {weeklySchedule ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Workout Notes Form Modal */}
            {showWorkoutNotesForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-lg rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{workoutNotes ? 'Edit Workout Notes' : 'Add Workout Notes'}</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Current Focus</label>
                                <textarea
                                    value={workoutNotesForm.current_focus}
                                    onChange={(e) => setWorkoutNotesForm((prev) => ({ ...prev, current_focus: e.target.value }))}
                                    placeholder='What are you focusing on in your workouts right now?'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Rest Times</label>
                                <textarea
                                    value={workoutNotesForm.rest_times}
                                    onChange={(e) => setWorkoutNotesForm((prev) => ({ ...prev, rest_times: e.target.value }))}
                                    placeholder='How long do you rest between sets?'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Progression</label>
                                <textarea
                                    value={workoutNotesForm.progression}
                                    onChange={(e) => setWorkoutNotesForm((prev) => ({ ...prev, progression: e.target.value }))}
                                    placeholder='How do you progress your workouts?'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>General Notes</label>
                                <textarea
                                    value={workoutNotesForm.general_notes}
                                    onChange={(e) => setWorkoutNotesForm((prev) => ({ ...prev, general_notes: e.target.value }))}
                                    placeholder='Any other workout-related notes or reminders'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetWorkoutNotesForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={addOrUpdateWorkoutNotes} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {workoutNotes ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lifestyle Goal Form Modal */}
            {showLifestyleGoalForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{editingLifestyleGoal ? 'Edit Lifestyle Goal' : 'Add Lifestyle Goal'}</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Title</label>
                                <input
                                    type='text'
                                    value={lifestyleGoalForm.title}
                                    onChange={(e) => setLifestyleGoalForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder='e.g., Sleep 7-8 Hours Nightly'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Description</label>
                                <input
                                    type='text'
                                    value={lifestyleGoalForm.description}
                                    onChange={(e) => setLifestyleGoalForm((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder='Brief description or context'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Status</label>
                                <select
                                    value={lifestyleGoalForm.status}
                                    onChange={(e) => setLifestyleGoalForm((prev) => ({ ...prev, status: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                    <option value='active'>Active</option>
                                    <option value='in_progress'>In Progress</option>
                                    <option value='completed'>Completed</option>
                                    <option value='paused'>Paused</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Target Value (Optional)</label>
                                <input
                                    type='text'
                                    value={lifestyleGoalForm.target_value}
                                    onChange={(e) => setLifestyleGoalForm((prev) => ({ ...prev, target_value: e.target.value }))}
                                    placeholder='e.g., 8 hours, 10 minutes daily'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Notes (Optional)</label>
                                <textarea
                                    value={lifestyleGoalForm.notes}
                                    onChange={(e) => setLifestyleGoalForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder='Additional notes or strategy'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetLifestyleGoalForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button
                                onClick={editingLifestyleGoal ? updateLifestyleGoal : addLifestyleGoal}
                                className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {editingLifestyleGoal ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Focus Form Modal */}
            {showCurrentFocusForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-lg rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>{currentFocus ? 'Update Current Focus' : 'Set Current Focus'}</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Period</label>
                                <input
                                    type='text'
                                    value={currentFocusForm.period}
                                    onChange={(e) => setCurrentFocusForm((prev) => ({ ...prev, period: e.target.value }))}
                                    placeholder='e.g., Q1 2024, This Month, Winter 2024'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Title</label>
                                <input
                                    type='text'
                                    value={currentFocusForm.title}
                                    onChange={(e) => setCurrentFocusForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder='e.g., Building Strength Foundation'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Description</label>
                                <textarea
                                    value={currentFocusForm.description}
                                    onChange={(e) => setCurrentFocusForm((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder='What are you focusing on right now and why?'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Key Metrics (JSON format)</label>
                                <textarea
                                    value={JSON.stringify(currentFocusForm.key_metrics, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(e.target.value);
                                            setCurrentFocusForm((prev) => ({ ...prev, key_metrics: parsed }));
                                        } catch {
                                            // Invalid JSON, let user continue typing
                                        }
                                    }}
                                    placeholder='{"weekly_workouts": "4-5 days", "protein_target": "150g daily"}'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={4}
                                />
                                <p className='mt-1 text-xs text-muted-foreground'>Enter key metrics as JSON. Example: {`{"weekly_workouts": "4 days", "sleep": "8 hours"}`}</p>
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetCurrentFocusForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={addOrUpdateCurrentFocus} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                {currentFocus ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Workout Form Modal */}
            {showWorkoutForm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='w-full max-w-md rounded-lg bg-card p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>Add Workout</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium'>Workout Name</label>
                                <input
                                    type='text'
                                    value={workoutForm.name}
                                    onChange={(e) => setWorkoutForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder='e.g., Morning Run'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-medium'>Type</label>
                                    <select
                                        value={workoutForm.type}
                                        onChange={(e) => setWorkoutForm((prev) => ({ ...prev, type: e.target.value }))}
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                        <option value=''>Select type</option>
                                        <option value='cardio'>Cardio</option>
                                        <option value='strength'>Strength</option>
                                        <option value='flexibility'>Flexibility</option>
                                        <option value='sports'>Sports</option>
                                        <option value='other'>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='text-sm font-medium'>Duration (min)</label>
                                    <input
                                        type='number'
                                        value={workoutForm.duration}
                                        onChange={(e) => setWorkoutForm((prev) => ({ ...prev, duration: e.target.value }))}
                                        placeholder='0'
                                        className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Date</label>
                                <input
                                    type='date'
                                    value={workoutForm.workout_date}
                                    onChange={(e) => setWorkoutForm((prev) => ({ ...prev, workout_date: e.target.value }))}
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Notes</label>
                                <textarea
                                    value={workoutForm.notes}
                                    onChange={(e) => setWorkoutForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder='Any additional notes...'
                                    className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className='mt-6 flex gap-2'>
                            <button onClick={resetWorkoutForm} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                                Cancel
                            </button>
                            <button onClick={addWorkout} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
