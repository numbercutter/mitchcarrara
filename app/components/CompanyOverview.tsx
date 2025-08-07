import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { companies } from '@/config/companies';
import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import Image from 'next/image';

interface PaymentsMetrics {
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

interface DiscordMetrics {
    total_members: number;
    total_channels: number;
    channels_by_type: {
        text: number;
        voice: number;
    };
    member_stats: {
        paid: number;
        unpaid: number;
        total: number;
    };
    channel_structure: Array<{
        id: string;
        name: string;
        channels: Array<{
            id: string;
            name: string;
            type: string;
            position: number;
        }>;
    }>;
    recent_activity: Array<{
        id: string;
        type: string;
        user: string;
        content: string;
        channel: string;
        created_at: string;
    }>;
}

interface SupportMetrics {
    total_threads: number;
    open_threads: number;
    response_time: number;
}

interface CompanyOverviewProps {
    type: 'payments' | 'discord' | 'support';
}

export function CompanyOverview({ type }: CompanyOverviewProps) {
    const { selectedCompany } = useCompany();
    const companyList = Object.values(companies);

    // Filter companies based on the requested type
    const filteredCompanyList = companyList.filter((company) => {
        switch (type) {
            case 'discord':
                return !!company.discord;
            case 'payments':
                return !!company.stripe;
            case 'support':
                return true; // Assuming all companies have support capability
            default:
                return true;
        }
    });

    const { data: metricsData } = useQuery({
        queryKey: ['company-metrics', type],
        queryFn: async () => {
            const responses = await Promise.all(
                filteredCompanyList.map(async (company) => {
                    const response = await fetch(`/api/${type}/metrics?company=${company.id}`);
                    if (!response.ok) return null;
                    const data = await response.json();
                    return { [company.id]: data };
                })
            );
            return Object.assign({}, ...responses.filter(Boolean));
        },
    });

    const renderMetrics = (company: typeof companies.rthmn, metrics: PaymentsMetrics | DiscordMetrics | SupportMetrics) => {
        switch (type) {
            case 'payments': {
                const paymentsMetrics = metrics as PaymentsMetrics;
                return (
                    <>
                        <div className='mt-2 grid grid-cols-2 gap-4 text-sm'>
                            <div>
                                <p className='text-muted-foreground'>Revenue</p>
                                <p className='font-medium'>${paymentsMetrics.total_revenue.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className='text-muted-foreground'>MRR</p>
                                <p className='font-medium'>${paymentsMetrics.mrr.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className='text-muted-foreground'>Customers</p>
                                <p className='font-medium'>{paymentsMetrics.total_customers}</p>
                            </div>
                            <div>
                                <p className='text-muted-foreground'>Active Subs</p>
                                <p className='font-medium'>{paymentsMetrics.total_subscriptions}</p>
                            </div>
                        </div>
                    </>
                );
            }
            case 'discord': {
                const discordMetrics = metrics as DiscordMetrics;
                return (
                    <>
                        <div className='mt-2 grid grid-cols-2 gap-4 text-sm'>
                            <div>
                                <p className='text-muted-foreground'>Members</p>
                                <p className='font-medium'>{discordMetrics.total_members}</p>
                            </div>
                            <div>
                                <p className='text-muted-foreground'>Channels</p>
                                <p className='font-medium'>{discordMetrics.total_channels}</p>
                            </div>
                            <div>
                                <p className='text-muted-foreground'>Paid</p>
                                <p className='font-medium'>{discordMetrics.member_stats.paid}</p>
                            </div>
                            <div>
                                <p className='text-muted-foreground'>Unpaid</p>
                                <p className='font-medium'>{discordMetrics.member_stats.unpaid}</p>
                            </div>
                        </div>
                    </>
                );
            }
            case 'support': {
                const supportMetrics = metrics as SupportMetrics;
                return (
                    <>
                        <div className='mt-2 grid grid-cols-2 gap-4 text-sm'>
                            <div>
                                <p className='text-muted-foreground'>Total Threads</p>
                                <p className='font-medium'>{supportMetrics.total_threads}</p>
                            </div>
                            <div>
                                <p className='text-muted-foreground'>Open Threads</p>
                                <p className='font-medium'>{supportMetrics.open_threads}</p>
                            </div>
                            <div>
                                <p className='text-muted-foreground'>Response Time</p>
                                <p className='font-medium'>{supportMetrics.response_time}m</p>
                            </div>
                        </div>
                    </>
                );
            }
        }
    };

    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredCompanyList.length === 0 ? (
                <Card className='col-span-full p-6'>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>No companies with {type} integration found.</p>
                    </div>
                </Card>
            ) : (
                filteredCompanyList.map((company) => {
                    const metrics = metricsData?.[company.id];
                    const isSelected = selectedCompany?.id === company.id;

                    return (
                        <Card key={company.id} className={isSelected ? 'ring-2 ring-primary' : ''}>
                            <CardHeader className='flex flex-row items-center gap-4 space-y-0 pb-2'>
                                <div className='relative h-8 w-8'>
                                    <Image src={company.logo} alt={company.name} fill className='rounded-sm object-contain' />
                                </div>
                                <CardTitle className='text-base'>{company.name}</CardTitle>
                            </CardHeader>
                            <CardContent>{metrics ? renderMetrics(company, metrics) : <p className='text-sm text-muted-foreground'>Loading metrics...</p>}</CardContent>
                        </Card>
                    );
                })
            )}
        </div>
    );
}
