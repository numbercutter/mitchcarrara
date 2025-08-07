'use client';

import { PortfolioOverview } from '@/app/components/PortfolioOverview';

export default function CompaniesOverviewPage() {
    return (
        <div className='space-y-8'>
            <div>
                <h1 className='text-3xl font-bold'>Companies Overview</h1>
                <p className='mt-2 text-muted-foreground'>A comprehensive view of all metrics across your portfolio companies.</p>
            </div>

            <PortfolioOverview />
        </div>
    );
}