import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { createHealthMetric } from '@/lib/database/actions';
import { TablesInsert } from '@/types/database';

export async function POST(request: NextRequest) {
    try {
        const { company, userId } = await getDatabaseContext();
        const body = await request.json();

        const metricData: Omit<TablesInsert<'health_metrics'>, 'user_id'> = {
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
        };

        const result = await createHealthMetric(company, userId, metricData);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error creating health metric:', error);
        return NextResponse.json({ error: 'Failed to create health metric' }, { status: 500 });
    }
}
