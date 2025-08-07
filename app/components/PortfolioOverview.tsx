import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { companies } from '@/config/companies';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Users, MessageSquare, CreditCard, Target, TrendingUp, LineChart, RefreshCcw, Trophy, Rocket, Crown, BarChart2, ChevronRight, ChevronLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AllMetrics {
    payments?: {
        total_revenue: number;
        total_customers: number;
        total_subscriptions: number;
        mrr: number;
    };
    discord?: {
        total_members: number;
        total_channels: number;
        member_stats: {
            paid: number;
            unpaid: number;
            total: number;
        };
    };
    support?: {
        total_threads: number;
        open_threads: number;
        response_time: number;
    };
}

// Growth Tiers - Business Level Progression System
const GROWTH_TIERS = [
    {
        id: 'startup',
        name: 'Startup',
        icon: Rocket,
        color: '#22c55e', // Green
        mrr: 12500, // $12.5K MRR ($150K ARR)
        vision: 'Establish product-market fit and build a loyal customer base',
        goals: ['Achieve $12.5K MRR ($150K ARR)', 'Build to 80+ active subscriptions', 'Establish core product offering'],
    },
    {
        id: 'growth',
        name: 'Growth Engine',
        icon: BarChart2,
        color: '#6366f1', // Indigo
        mrr: 50000, // $50K MRR ($600K ARR)
        vision: 'Scale operations and expand market reach',
        goals: ['Reach $50K MRR ($600K ARR)', 'Expand to 250+ active subscriptions', 'Launch premium tier offerings'],
    },
    {
        id: 'scale',
        name: 'Scale Master',
        icon: Trophy,
        color: '#f59e0b', // Amber
        mrr: 100000, // $100K MRR ($1.2M ARR)
        vision: 'Optimize operations and prepare for market dominance',
        goals: ['Achieve $100K MRR ($1.2M ARR)', 'Grow to 500+ active subscriptions', 'Establish industry leadership'],
    },
    {
        id: 'empire',
        name: 'Empire Builder',
        icon: Crown,
        color: '#8b5cf6', // Violet
        mrr: 1000000, // $1M MRR ($12M ARR)
        vision: 'Dominate the market and transform the industry',
        goals: ['Reach $1M MRR ($12M ARR)', 'Build to 2,500+ active subscriptions', 'Expand into new markets and verticals'],
    },
];

// KPI Targets - standardized for consistency
const KPI_TARGETS = {
    // Annual revenue target - based on current growth tier
    annualRevenue: GROWTH_TIERS[0].mrr * 12,
    // Monthly recurring revenue target
    mrr: GROWTH_TIERS[0].mrr,
    // Target for active subscriptions
    subscriptions: 80,
    // Target for subscription coverage (% of customers with active subscriptions)
    subscriptionCoverage: 0.85,
    // Target for total community members
    members: 2000,
    // Target for support response time
    responseTime: 30, // minutes
};

// Helper function to calculate KPI progress
const calculateProgress = (current: number, target: number) => {
    const progress = Math.min(Math.round((current / target) * 100), 100);
    return progress;
};

// Helper function to format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export function PortfolioOverview() {
    // State to track which growth tier is currently selected in the UI
    const [selectedTierIndex, setSelectedTierIndex] = useState(0);
    const selectedTier = GROWTH_TIERS[selectedTierIndex];

    // Function to move to next or previous tier
    const navigateTier = (direction: 'next' | 'prev') => {
        if (direction === 'next' && selectedTierIndex < GROWTH_TIERS.length - 1) {
            setSelectedTierIndex(selectedTierIndex + 1);
        } else if (direction === 'prev' && selectedTierIndex > 0) {
            setSelectedTierIndex(selectedTierIndex - 1);
        }
    };

    const companyList = Object.values(companies);

    // Fetch all metrics types for all companies
    const { data: metricsData } = useQuery({
        queryKey: ['all-metrics'],
        queryFn: async () => {
            const metricTypes = ['payments', 'discord', 'support'];
            const allData: Record<string, AllMetrics> = {};

            await Promise.all(
                companyList.map(async (company) => {
                    allData[company.id] = {};
                    await Promise.all(
                        metricTypes.map(async (type) => {
                            try {
                                const response = await fetch(`/api/${type}/metrics?company=${company.id}`);
                                if (response.ok) {
                                    const data = await response.json();
                                    allData[company.id][type as keyof AllMetrics] = data;
                                }
                            } catch (error) {
                                console.error(`Error fetching ${type} metrics for ${company.id}:`, error);
                            }
                        })
                    );
                })
            );

            return allData;
        },
    });

    // Calculate portfolio totals
    const portfolioTotals = Object.values(metricsData || {}).reduce(
        (totals, companyMetrics) => ({
            revenue: totals.revenue + (companyMetrics.payments?.total_revenue || 0),
            mrr: totals.mrr + (companyMetrics.payments?.mrr || 0),
            customers: totals.customers + (companyMetrics.payments?.total_customers || 0),
            subscriptions: totals.subscriptions + (companyMetrics.payments?.total_subscriptions || 0),
            members: totals.members + (companyMetrics.discord?.total_members || 0),
            paidMembers: totals.paidMembers + (companyMetrics.discord?.member_stats?.paid || 0),
            threads: totals.threads + (companyMetrics.support?.total_threads || 0),
            openThreads: totals.openThreads + (companyMetrics.support?.open_threads || 0),
            responseTime: Math.max(totals.responseTime, companyMetrics.support?.response_time || 0),
        }),
        {
            revenue: 0,
            mrr: 0,
            customers: 0,
            subscriptions: 0,
            members: 0,
            paidMembers: 0,
            threads: 0,
            openThreads: 0,
            responseTime: 0,
        }
    );

    // Calculate current progress within the growth tier system
    const currentTierIndex = GROWTH_TIERS.findIndex((tier, index) => {
        // If we're at the last tier, check if we've surpassed it
        if (index === GROWTH_TIERS.length - 1) {
            return portfolioTotals.mrr < tier.mrr;
        }
        // Otherwise check if we're between this tier and the next
        return portfolioTotals.mrr < tier.mrr;
    });

    // If we've surpassed all tiers, set to the last one
    const activeTierIndex = currentTierIndex === -1 ? GROWTH_TIERS.length - 1 : currentTierIndex;
    const activeTier = GROWTH_TIERS[activeTierIndex];
    const nextTier = activeTierIndex < GROWTH_TIERS.length - 1 ? GROWTH_TIERS[activeTierIndex + 1] : null;

    // Calculate progress within the current tier
    const previousTierMRR = activeTierIndex > 0 ? GROWTH_TIERS[activeTierIndex - 1].mrr : 0;
    const tierProgressPercent = nextTier ? Math.min(100, Math.round(((portfolioTotals.mrr - previousTierMRR) / (activeTier.mrr - previousTierMRR)) * 100)) : 100; // If on the last tier, show full progress if we've reached it

    // Calculate average revenue per subscription (ARPU)
    const arpu = portfolioTotals.subscriptions > 0 ? portfolioTotals.mrr / portfolioTotals.subscriptions : 0;

    // Calculate subscription coverage (what % of customers have active subscriptions)
    const subscriptionCoverage = portfolioTotals.customers > 0 ? portfolioTotals.subscriptions / portfolioTotals.customers : 0;

    // Calculate subscription gap (customers without active subscriptions)
    const subscriptionGap = Math.max(0, portfolioTotals.customers - portfolioTotals.subscriptions);

    // Generate standardized per-company target for charts
    const companyCount = companyList.filter((company) => metricsData?.[company.id]?.payments).length || 1;
    const targetPerCompany = {
        annualRevenue: KPI_TARGETS.annualRevenue / companyCount,
        mrr: KPI_TARGETS.mrr / companyCount,
        subscriptions: KPI_TARGETS.subscriptions / companyCount,
    };

    // Generate data for revenue chart by company
    const revenueChartData = companyList
        .filter((company) => metricsData?.[company.id]?.payments)
        .map((company) => ({
            name: company.name,
            revenue: metricsData?.[company.id]?.payments?.total_revenue || 0,
            mrr: metricsData?.[company.id]?.payments?.mrr || 0,
            targetRevenue: targetPerCompany.annualRevenue,
            targetMRR: targetPerCompany.mrr,
        }));

    // Generate data for subscription coverage chart by company
    const subscriptionCoverageData = companyList
        .filter((company) => metricsData?.[company.id]?.payments)
        .map((company) => {
            const customers = metricsData?.[company.id]?.payments?.total_customers || 0;
            const subscriptions = metricsData?.[company.id]?.payments?.total_subscriptions || 0;
            return {
                name: company.name,
                customers,
                subscriptions,
                coverage: customers > 0 ? (subscriptions / customers) * 100 : 0,
                gap: Math.max(0, customers - subscriptions),
            };
        })
        .filter((item) => item.customers > 0); // Only include companies with customers

    return (
        <div className='space-y-8 bg-gradient-to-br from-background via-background/95 to-background/90 p-6'>
            {/* Organization Header */}
            <div className='mb-12'>
                <h1 className='bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent'>
                    Reality Designers
                </h1>
                <p className='mt-2 text-center tracking-wide text-muted-foreground'>Portfolio Management Dashboard</p>
            </div>

            {/* Growth Tier System */}
            <div>
                <h2 className='mb-6 text-2xl font-semibold tracking-tight'>Business Growth Journey</h2>
                <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]'>
                    <CardContent className='pt-8'>
                        {/* Tier Navigation */}
                        <div className='mb-6 flex items-center justify-between'>
                            <button
                                onClick={() => navigateTier('prev')}
                                disabled={selectedTierIndex === 0}
                                className={cn(
                                    'rounded-full border p-2 transition-all duration-200',
                                    selectedTierIndex === 0
                                        ? 'cursor-not-allowed border-border/50 text-muted-foreground/50'
                                        : 'text-foreground hover:border-primary/50 hover:bg-primary/10'
                                )}>
                                <ChevronLeft className='h-5 w-5' />
                            </button>

                            <div className='flex space-x-3'>
                                {GROWTH_TIERS.map((tier, index) => {
                                    const IconComponent = tier.icon;
                                    return (
                                        <button
                                            key={tier.id}
                                            onClick={() => setSelectedTierIndex(index)}
                                            className={cn(
                                                'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                                                selectedTierIndex === index
                                                    ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-foreground shadow-lg'
                                                    : 'bg-card/50 text-muted-foreground hover:bg-primary/5',
                                                index === activeTierIndex && 'ring-2 ring-primary/50 ring-offset-2'
                                            )}
                                            style={{
                                                backgroundColor: selectedTierIndex === index ? tier.color : undefined,
                                                opacity: selectedTierIndex === index ? 1 : 0.7,
                                            }}>
                                            <span className='flex items-center space-x-2'>
                                                <IconComponent className='h-4 w-4' />
                                                <span>{tier.name}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => navigateTier('next')}
                                disabled={selectedTierIndex === GROWTH_TIERS.length - 1}
                                className={cn(
                                    'rounded-full border p-2 transition-all duration-200',
                                    selectedTierIndex === GROWTH_TIERS.length - 1
                                        ? 'cursor-not-allowed border-border/50 text-muted-foreground/50'
                                        : 'text-foreground hover:border-primary/50 hover:bg-primary/10'
                                )}>
                                <ChevronRight className='h-5 w-5' />
                            </button>
                        </div>

                        {/* Tier Content */}
                        <div className='mb-8'>
                            <div className='mb-4 flex items-center justify-between'>
                                <div className='flex items-center space-x-3'>
                                    {(() => {
                                        const IconComponent = selectedTier.icon;
                                        return <IconComponent className='h-6 w-6' style={{ color: selectedTier.color }} />;
                                    })()}
                                    <h3 className='text-2xl font-bold tracking-tight'>{selectedTier.name}</h3>
                                </div>
                                <div className='text-sm font-medium text-muted-foreground'>
                                    {formatCurrency(selectedTier.mrr)}/mo ({formatCurrency(selectedTier.mrr * 12)}/yr)
                                </div>
                            </div>

                            <div className='mb-6'>
                                <p className='mb-2 text-sm font-medium tracking-wide'>Vision</p>
                                <p className='text-sm leading-relaxed text-muted-foreground'>{selectedTier.vision}</p>
                            </div>

                            <div>
                                <p className='mb-3 text-sm font-medium tracking-wide'>Key Goals</p>
                                <ul className='space-y-2'>
                                    {selectedTier.goals.map((goal, index) => (
                                        <li key={index} className='flex items-start space-x-2 text-sm text-muted-foreground'>
                                            <span className='mt-1 h-1.5 w-1.5 rounded-full bg-primary/50' />
                                            <span>{goal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Progress Toward Next Tier */}
                        <div>
                            <div className='mb-3 flex items-center justify-between'>
                                <span className='text-sm font-medium'>Current Progress: {formatCurrency(portfolioTotals.mrr)}/mo</span>
                                <span className='text-sm text-muted-foreground'>
                                    {activeTierIndex < GROWTH_TIERS.length - 1
                                        ? `${formatCurrency(GROWTH_TIERS[activeTierIndex].mrr)} to ${formatCurrency(GROWTH_TIERS[activeTierIndex + 1].mrr)}`
                                        : `${formatCurrency(GROWTH_TIERS[activeTierIndex].mrr)}+`}
                                </span>
                            </div>
                            <div className='h-2.5 w-full overflow-hidden rounded-full border border-border/50 bg-secondary/50'>
                                <div
                                    className='h-full rounded-full transition-all duration-500 ease-in-out'
                                    style={{
                                        width: `${tierProgressPercent}%`,
                                        background: `linear-gradient(90deg, ${activeTier.color} 0%, ${activeTier.color}80 100%)`,
                                    }}
                                />
                            </div>
                            <div className='mt-2 flex justify-between text-xs text-muted-foreground'>
                                <span>{activeTierIndex > 0 ? GROWTH_TIERS[activeTierIndex - 1].name : 'Start'}</span>
                                <span>{nextTier ? nextTier.name : ''}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KPI Targets Section */}
            <div>
                <h2 className='mb-6 text-2xl font-semibold tracking-tight'>Key Performance Indicators</h2>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>MRR Target</CardTitle>
                            <TrendingUp className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='mb-3 flex items-center justify-between'>
                                <span className='text-2xl font-bold tracking-tight'>{formatCurrency(portfolioTotals.mrr)}</span>
                                <span className='text-sm text-muted-foreground'>of {formatCurrency(KPI_TARGETS.mrr)}</span>
                            </div>
                            <Progress value={calculateProgress(portfolioTotals.mrr, KPI_TARGETS.mrr)} className='h-2 border border-border/50 bg-secondary/50' />
                            <p className='mt-2 text-xs text-muted-foreground'>
                                {calculateProgress(portfolioTotals.mrr, KPI_TARGETS.mrr)}% of monthly target ({formatCurrency(KPI_TARGETS.annualRevenue)} annually)
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>Active Subscriptions</CardTitle>
                            <RefreshCcw className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='mb-3 flex items-center justify-between'>
                                <span className='text-2xl font-bold tracking-tight'>{portfolioTotals.subscriptions}</span>
                                <span className='text-sm text-muted-foreground'>of {KPI_TARGETS.subscriptions}</span>
                            </div>
                            <Progress value={calculateProgress(portfolioTotals.subscriptions, KPI_TARGETS.subscriptions)} className='h-2 bg-secondary/50' />
                            <p className='mt-2 text-xs text-muted-foreground'>
                                {calculateProgress(portfolioTotals.subscriptions, KPI_TARGETS.subscriptions)}% of subscription target
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>ARPU (Monthly)</CardTitle>
                            <CreditCard className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='mb-3 flex items-center justify-between'>
                                <span className='text-2xl font-bold tracking-tight'>{formatCurrency(arpu)}</span>
                                <span className='text-sm text-muted-foreground'>per subscriber</span>
                            </div>
                            <div className='h-2 w-full rounded-full bg-secondary/50'>
                                <div className='h-full rounded-full bg-primary' style={{ width: `${Math.min(100, (arpu / 500) * 100)}%` }} />
                            </div>
                            <p className='mt-2 text-xs text-muted-foreground'>
                                {portfolioTotals.mrr.toLocaleString()} MRR ÷ {portfolioTotals.subscriptions} subscribers
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>Total Members</CardTitle>
                            <Users className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='mb-3 flex items-center justify-between'>
                                <span className='text-2xl font-bold tracking-tight'>{portfolioTotals.members}</span>
                                <span className='text-sm text-muted-foreground'>of {KPI_TARGETS.members}</span>
                            </div>
                            <Progress value={calculateProgress(portfolioTotals.members, KPI_TARGETS.members)} className='h-2 bg-secondary/50' />
                            <p className='mt-2 text-xs text-muted-foreground'>
                                {portfolioTotals.paidMembers} paid users ({((portfolioTotals.paidMembers / portfolioTotals.members) * 100).toFixed(0)}%)
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>Revenue Target</CardTitle>
                            <Target className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='mb-3 flex items-center justify-between'>
                                <span className='text-2xl font-bold tracking-tight'>{formatCurrency(portfolioTotals.revenue)}</span>
                                <span className='text-sm text-muted-foreground'>of {formatCurrency(KPI_TARGETS.annualRevenue)}</span>
                            </div>
                            <Progress value={calculateProgress(portfolioTotals.revenue, KPI_TARGETS.annualRevenue)} className='h-2 bg-secondary/50' />
                            <p className='mt-2 text-xs text-muted-foreground'>
                                {calculateProgress(portfolioTotals.revenue, KPI_TARGETS.annualRevenue)}% of annual target ({formatCurrency(KPI_TARGETS.mrr)} monthly)
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>Response Time</CardTitle>
                            <MessageSquare className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='mb-3 flex items-center justify-between'>
                                <span className='text-2xl font-bold tracking-tight'>{portfolioTotals.responseTime}m</span>
                                <span className='text-sm text-muted-foreground'>target: {KPI_TARGETS.responseTime}m</span>
                            </div>
                            <Progress value={100 - calculateProgress(portfolioTotals.responseTime, KPI_TARGETS.responseTime)} className='h-2 bg-secondary/50' />
                            <p className='mt-2 text-xs text-muted-foreground'>
                                {portfolioTotals.openThreads} open of {portfolioTotals.threads} total threads
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>Subscription Coverage</CardTitle>
                            <CreditCard className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='mb-3 flex items-center justify-between'>
                                <span className='text-2xl font-bold tracking-tight'>{(subscriptionCoverage * 100).toFixed(1)}%</span>
                                <span className='text-sm text-muted-foreground'>of {(KPI_TARGETS.subscriptionCoverage * 100).toFixed(0)}% target</span>
                            </div>
                            <Progress value={calculateProgress(subscriptionCoverage, KPI_TARGETS.subscriptionCoverage)} className='h-2 bg-secondary/50' />
                            <p className='mt-2 text-xs text-muted-foreground'>{subscriptionGap} customers without active subscriptions</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Charts Section */}
            <div className='space-y-6'>
                <h2 className='text-2xl font-semibold tracking-tight'>Performance Analysis</h2>

                <div className='grid gap-6 md:grid-cols-2'>
                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]'>
                        <CardHeader>
                            <CardTitle className='text-lg font-semibold tracking-tight'>Revenue by Company</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='h-80'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <BarChart
                                        data={revenueChartData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 30,
                                        }}>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#ffffff10' />
                                        <XAxis dataKey='name' stroke='#ffffff80' />
                                        <YAxis stroke='#ffffff80' />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                backdropFilter: 'blur(8px)',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            }}
                                            formatter={(value, name) => {
                                                return [formatCurrency(Number(value)), name];
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey='revenue' name='Total Revenue' fill='url(#revenueGradient)' />
                                        <Bar dataKey='mrr' name='Monthly Revenue (×12)' fill='url(#mrrGradient)' />
                                        <Bar dataKey='targetRevenue' name='Annual Target' fill='url(#targetGradient)' />
                                        <defs>
                                            <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                                                <stop offset='5%' stopColor='#6366f1' stopOpacity={0.9} />
                                                <stop offset='95%' stopColor='#6366f1' stopOpacity={0.3} />
                                            </linearGradient>
                                            <linearGradient id='mrrGradient' x1='0' y1='0' x2='0' y2='1'>
                                                <stop offset='5%' stopColor='#22c55e' stopOpacity={0.9} />
                                                <stop offset='95%' stopColor='#22c55e' stopOpacity={0.3} />
                                            </linearGradient>
                                            <linearGradient id='targetGradient' x1='0' y1='0' x2='0' y2='1'>
                                                <stop offset='5%' stopColor='#94a3b8' stopOpacity={0.9} />
                                                <stop offset='95%' stopColor='#94a3b8' stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]'>
                        <CardHeader>
                            <CardTitle className='text-lg font-semibold tracking-tight'>Subscription Coverage by Company</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='h-80'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <BarChart
                                        data={subscriptionCoverageData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 30,
                                        }}>
                                        <CartesianGrid strokeDasharray='3 3' />
                                        <XAxis dataKey='name' />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                backdropFilter: 'blur(8px)',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            }}
                                            formatter={(value, name) => {
                                                if (name === 'coverage') return [`${Number(value).toFixed(1)}%`, 'Coverage'];
                                                if (name === 'gap') return [value, 'Customers without subscriptions'];
                                                return [value, name];
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey='customers' name='Total Customers' fill='#94a3b8' />
                                        <Bar dataKey='subscriptions' name='Active Subscriptions' fill='#22c55e' />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Portfolio Summary */}
            <div>
                <h2 className='mb-6 text-2xl font-semibold tracking-tight'>Portfolio Summary</h2>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>Subscription Revenue</CardTitle>
                            <CreditCard className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold tracking-tight'>${portfolioTotals.mrr.toLocaleString()}/mo</div>
                            <p className='text-xs text-muted-foreground'>
                                {portfolioTotals.subscriptions} active subscriptions · ${arpu.toFixed(0)} ARPU
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium tracking-wide'>Support Threads</CardTitle>
                            <MessageSquare className='h-4 w-4 text-primary/70' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold tracking-tight'>{portfolioTotals.threads.toLocaleString()}</div>
                            <p className='text-xs text-muted-foreground'>{portfolioTotals.openThreads} open threads</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Company Cards */}
            <div>
                <h2 className='mb-6 text-2xl font-semibold tracking-tight'>Company Details</h2>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {companyList.map((company) => {
                        const metrics = metricsData?.[company.id];
                        return (
                            <Card
                                key={company.id}
                                className='border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'>
                                <CardHeader className='flex flex-row items-center gap-4 space-y-0 pb-2'>
                                    <div className='relative h-10 w-10 overflow-hidden rounded-lg border border-border/50'>
                                        <Image src={company.logo} alt={company.name} fill className='object-contain' />
                                    </div>
                                    <CardTitle className='text-lg font-semibold tracking-tight'>{company.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {metrics ? (
                                        <div className='space-y-6'>
                                            {/* Payments */}
                                            {metrics.payments && (
                                                <div>
                                                    <p className='text-sm font-medium tracking-wide'>Subscriptions</p>
                                                    <div className='mt-1 grid grid-cols-2 gap-2 text-sm'>
                                                        <div>
                                                            <p className='text-muted-foreground'>Active</p>
                                                            <p className='font-medium'>{metrics.payments.total_subscriptions}</p>
                                                        </div>
                                                        <div>
                                                            <p className='text-muted-foreground'>MRR</p>
                                                            <p className='font-medium'>${metrics.payments.mrr.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className='mt-2 grid grid-cols-2 gap-2 text-sm'>
                                                        <div>
                                                            <p className='text-muted-foreground'>Customers</p>
                                                            <p className='font-medium'>{metrics.payments.total_customers}</p>
                                                        </div>
                                                        <div>
                                                            <p className='text-muted-foreground'>Coverage</p>
                                                            <p className='font-medium'>
                                                                {metrics.payments.total_customers > 0
                                                                    ? ((metrics.payments.total_subscriptions / metrics.payments.total_customers) * 100).toFixed(0)
                                                                    : 0}
                                                                %
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Discord */}
                                            {metrics.discord && (
                                                <div>
                                                    <p className='text-sm font-medium tracking-wide'>Community</p>
                                                    <div className='mt-1 grid grid-cols-2 gap-2 text-sm'>
                                                        <div>
                                                            <p className='text-muted-foreground'>Members</p>
                                                            <p className='font-medium'>{metrics.discord.total_members.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className='text-muted-foreground'>Paid</p>
                                                            <p className='font-medium'>{metrics.discord.member_stats.paid.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Support */}
                                            {metrics.support && (
                                                <div>
                                                    <p className='text-sm font-medium tracking-wide'>Support</p>
                                                    <div className='mt-1 grid grid-cols-2 gap-2 text-sm'>
                                                        <div>
                                                            <p className='text-muted-foreground'>Threads</p>
                                                            <p className='font-medium'>{metrics.support.total_threads.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className='text-muted-foreground'>Response</p>
                                                            <p className='font-medium'>{metrics.support.response_time}m</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className='text-sm text-muted-foreground'>Loading metrics...</p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
