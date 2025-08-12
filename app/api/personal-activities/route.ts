import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseContext } from '@/lib/database/server-helpers';
import { createPersonalActivity } from '@/lib/database/actions';
import { TablesInsert } from '@/types/database';

export async function POST(request: NextRequest) {
    try {
        const { company, userId } = await getDatabaseContext();
        const body = await request.json();

        const activityData: Omit<TablesInsert<'personal_activities'>, 'user_id'> = {
            title: body.title,
            activity_type: body.activity_type,
            description: body.description || null,
            activity_date: body.activity_date || new Date().toISOString().split('T')[0],
            duration: body.duration || null,
            metadata: body.metadata || null,
        };

        const result = await createPersonalActivity(company, userId, activityData);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error creating personal activity:', error);
        return NextResponse.json({ error: 'Failed to create personal activity' }, { status: 500 });
    }
}
