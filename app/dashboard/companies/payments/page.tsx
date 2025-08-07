'use client';

import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react';

interface PaymentData {
    total_revenue: number;
    total_customers: number;
    total_subscriptions: number;
    mrr: number;
    recent_payments: Array<{
        id: string;
        amount: number;
        customer: string;
        status: string;
        created_at: string;
    }>;
}

export default function PaymentsPage() {
    const { selectedCompany } = useCompany();

    const { data: paymentData, isLoading } = useQuery<PaymentData>({
        queryKey: ['payments', selectedCompany?.id],
        queryFn: async () => {
            const response = await fetch(`/api/payments/metrics?company=${selectedCompany?.id}`);
            if (!response.ok) throw new Error('Failed to fetch payment data');
            return response.json();
        },
        enabled: !!selectedCompany,
    });

    if (isLoading || !selectedCompany) {
        return <div>Loading...</div>;
    }

    return (
        <div className='space-y-4'>
            <h1 className='text-3xl font-bold'>Payments</h1>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
                        <DollarSign className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>${paymentData?.total_revenue.toLocaleString()}</div>
                        <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Customers</CardTitle>
                        <Users className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{paymentData?.total_customers}</div>
                        <p className='text-xs text-muted-foreground'>+12% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Active Subscriptions</CardTitle>
                        <CreditCard className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{paymentData?.total_subscriptions}</div>
                        <p className='text-xs text-muted-foreground'>+8% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Monthly Recurring Revenue</CardTitle>
                        <TrendingUp className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>${paymentData?.mrr.toLocaleString()}</div>
                        <p className='text-xs text-muted-foreground'>+15% from last month</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
