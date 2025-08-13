import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { supabase, userId } = await getDatabaseContext();
        const body = await request.json();

        const { data, error } = await supabase
            .from('health_metrics')
            .insert({
                metric_date: body.metric_date || new Date().toISOString().split('T')[0],
                weight: body.weight || null,
                body_fat_percentage: body.body_fat_percentage || null,
                blood_pressure_systolic: body.blood_pressure_systolic || null,
                blood_pressure_diastolic: body.blood_pressure_diastolic || null,
                heart_rate_avg: body.heart_rate_avg || null,
                sleep_hours: body.sleep_hours || null,
                steps: body.steps || null,
                water_intake: body.water_intake || null,
                notes: body.notes || null,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating health metric:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/dashboard/personal/health');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating health metric:', error);
        return NextResponse.json({ error: 'Failed to create health metric' }, { status: 500 });
    }
}
