import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';

export async function GET(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        
        // Get current week date range
        const today = new Date();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // End of week (Saturday)
        
        // Get last week date range
        const lastWeekStart = new Date(currentWeekStart);
        lastWeekStart.setDate(currentWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(currentWeekEnd);
        lastWeekEnd.setDate(currentWeekEnd.getDate() - 7);

        // Format dates for query
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        // Fetch this week's time entries
        const { data: thisWeekEntries, error: thisWeekError } = await supabase
            .from('time_entries')
            .select(`
                *,
                tasks:task_id (
                    id,
                    title,
                    status,
                    priority
                )
            `)
            .eq('user_id', userId)
            .gte('date', formatDate(currentWeekStart))
            .lte('date', formatDate(currentWeekEnd));

        if (thisWeekError) {
            console.error('Error fetching this week entries:', thisWeekError);
            return NextResponse.json({ error: thisWeekError.message }, { status: 400 });
        }

        // Fetch last week's time entries
        const { data: lastWeekEntries, error: lastWeekError } = await supabase
            .from('time_entries')
            .select('minutes')
            .eq('user_id', userId)
            .gte('date', formatDate(lastWeekStart))
            .lte('date', formatDate(lastWeekEnd));

        if (lastWeekError) {
            console.error('Error fetching last week entries:', lastWeekError);
            return NextResponse.json({ error: lastWeekError.message }, { status: 400 });
        }

        // Calculate statistics
        const thisWeekTotal = thisWeekEntries?.reduce((sum, entry) => sum + (entry.minutes || 0), 0) || 0;
        const lastWeekTotal = lastWeekEntries?.reduce((sum, entry) => sum + (entry.minutes || 0), 0) || 0;

        // Group by day of week (0 = Sunday, 1 = Monday, etc.)
        const dailyHours = new Array(7).fill(0);
        thisWeekEntries?.forEach(entry => {
            if (entry.date) {
                const entryDate = new Date(entry.date);
                const dayOfWeek = entryDate.getDay();
                dailyHours[dayOfWeek] += (entry.minutes || 0) / 60; // Convert to hours
            }
        });

        // Find most worked task
        const taskTimeMap = new Map<string, { title: string; minutes: number }>();
        thisWeekEntries?.forEach(entry => {
            if (entry.task_id && entry.tasks) {
                const existing = taskTimeMap.get(entry.task_id) || { title: entry.tasks.title, minutes: 0 };
                existing.minutes += entry.minutes || 0;
                taskTimeMap.set(entry.task_id, existing);
            }
        });

        const mostWorkedTask = Array.from(taskTimeMap.values())
            .sort((a, b) => b.minutes - a.minutes)[0];

        // Find most productive day
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mostProductiveDay = dailyHours.indexOf(Math.max(...dailyHours));

        const stats = {
            thisWeek: {
                totalHours: thisWeekTotal / 60, // Convert minutes to hours
                totalMinutes: thisWeekTotal,
                dailyHours: dailyHours, // Already in hours
                mostWorkedTask: mostWorkedTask?.title || null,
                mostWorkedHours: mostWorkedTask ? mostWorkedTask.minutes / 60 : 0,
                mostProductiveDay: dayNames[mostProductiveDay]
            },
            lastWeek: {
                totalHours: lastWeekTotal / 60,
                totalMinutes: lastWeekTotal
            },
            comparison: {
                hoursDifference: (thisWeekTotal - lastWeekTotal) / 60,
                percentageChange: lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching time tracking stats:', error);
        return NextResponse.json({ error: 'Failed to fetch time tracking stats' }, { status: 500 });
    }
}