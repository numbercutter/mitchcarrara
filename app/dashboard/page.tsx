'use client';

export default function DashboardPage() {
    return (
        <div className='space-y-8'>
            <div>
                <h1 className='text-3xl font-bold'>Personal Dashboard</h1>
                <p className='mt-2 text-muted-foreground'>Welcome to your personal dashboard. Manage your life, projects, and companies all in one place.</p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='text-lg font-semibold'>Quick Stats</h3>
                    <p className='mt-2 text-sm text-muted-foreground'>Your daily overview will go here</p>
                </div>
                
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='text-lg font-semibold'>Recent Activity</h3>
                    <p className='mt-2 text-sm text-muted-foreground'>Recent updates across all areas</p>
                </div>
                
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='text-lg font-semibold'>Upcoming Tasks</h3>
                    <p className='mt-2 text-sm text-muted-foreground'>Your agenda and priorities</p>
                </div>
            </div>
        </div>
    );
}
