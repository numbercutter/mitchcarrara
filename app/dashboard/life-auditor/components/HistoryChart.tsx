'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, BarChart3, Calendar, Target } from 'lucide-react';

interface HistoryChartProps {
    history: any[];
}

export default function HistoryChart({ history }: HistoryChartProps) {
    const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [viewType, setViewType] = useState<'overview' | 'trends' | 'categories'>('overview');

    if (!history || history.length === 0) {
        return <div className='flex h-64 items-center justify-center text-muted-foreground'>No history data available yet</div>;
    }

    // Filter data based on timeframe
    const filterHistoryByTimeframe = (timeframe: string) => {
        if (timeframe === 'all') return history;

        const now = new Date();
        const daysBack = parseInt(timeframe.replace('d', ''));
        const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        return history.filter((entry) => new Date(entry.created_at) >= cutoffDate);
    };

    const filteredHistory = filterHistoryByTimeframe(selectedTimeframe);
    const sortedHistory = [...filteredHistory].reverse(); // oldest first for charts

    // Calculate statistics
    const calculateStats = () => {
        if (sortedHistory.length === 0) return null;

        const scores = sortedHistory.map((entry) => entry.composite_percentage || 0);
        const latestScore = scores[scores.length - 1];
        const earliestScore = scores[0];
        const change = latestScore - earliestScore;
        const changePercent = earliestScore > 0 ? (change / earliestScore) * 100 : 0;

        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        return {
            latest: latestScore,
            earliest: earliestScore,
            change,
            changePercent,
            max: maxScore,
            min: minScore,
            average: avgScore,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        };
    };

    const stats = calculateStats();

    // Main trend chart
    const renderTrendChart = () => {
        const chartHeight = 300;
        const chartWidth = '100%';
        const padding = 40;
        const maxScore = 100;

        if (sortedHistory.length < 2) {
            return <div className='flex h-64 items-center justify-center text-muted-foreground'>Need at least 2 data points for trend chart</div>;
        }

        const createPath = () => {
            const points = sortedHistory.map((entry, index) => {
                const x = padding + (index * (800 - 2 * padding)) / (sortedHistory.length - 1);
                const y = chartHeight - padding - ((entry.composite_percentage || 0) * (chartHeight - 2 * padding)) / maxScore;
                return `${x},${y}`;
            });
            return `M ${points.join(' L ')}`;
        };

        const getScoreColor = (score: number) => {
            if (score < 20) return '#ef4444';
            if (score < 40) return '#f59e0b';
            if (score < 60) return '#6b7280';
            if (score < 80) return '#3b82f6';
            return '#10b981';
        };

        return (
            <div className='w-full overflow-x-auto'>
                <svg width={800} height={chartHeight} className='rounded border' style={{ backgroundColor: 'hsl(var(--card))' }}>
                    {/* Grid lines */}
                    {[0, 20, 40, 60, 80, 100].map((value) => {
                        const y = chartHeight - padding - (value * (chartHeight - 2 * padding)) / maxScore;
                        return (
                            <g key={value}>
                                <line x1={padding} y1={y} x2={800 - padding} y2={y} stroke='hsl(var(--border))' strokeWidth={1} strokeDasharray='2,2' />
                                <text x={padding - 10} y={y + 4} textAnchor='end' fontSize='12' fill='hsl(var(--muted-foreground))'>
                                    {value}%
                                </text>
                            </g>
                        );
                    })}

                    {/* Area fill */}
                    <defs>
                        <linearGradient id='scoreGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                            <stop offset='0%' stopColor={getScoreColor(stats?.latest || 0)} stopOpacity={0.3} />
                            <stop offset='100%' stopColor={getScoreColor(stats?.latest || 0)} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>

                    <path
                        d={`${createPath()} L ${padding + ((sortedHistory.length - 1) * (800 - 2 * padding)) / (sortedHistory.length - 1)},${chartHeight - padding} L ${padding},${chartHeight - padding} Z`}
                        fill='url(#scoreGradient)'
                    />

                    {/* Main line */}
                    <path d={createPath()} fill='none' stroke={getScoreColor(stats?.latest || 0)} strokeWidth={3} />

                    {/* Data points */}
                    {sortedHistory.map((entry, index) => {
                        const x = padding + (index * (800 - 2 * padding)) / (sortedHistory.length - 1);
                        const y = chartHeight - padding - ((entry.composite_percentage || 0) * (chartHeight - 2 * padding)) / maxScore;

                        return (
                            <circle key={entry.id} cx={x} cy={y} r={5} fill={getScoreColor(entry.composite_percentage || 0)} stroke='white' strokeWidth={2}>
                                <title>
                                    {new Date(entry.created_at).toLocaleDateString()}: {(entry.composite_percentage || 0).toFixed(1)}%
                                </title>
                            </circle>
                        );
                    })}

                    {/* Date labels */}
                    {sortedHistory.map((entry, index) => {
                        if (index % Math.ceil(sortedHistory.length / 6) === 0 || index === sortedHistory.length - 1) {
                            const x = padding + (index * (800 - 2 * padding)) / (sortedHistory.length - 1);
                            return (
                                <text key={`date-${entry.id}`} x={x} y={chartHeight - 10} textAnchor='middle' fontSize='10' fill='hsl(var(--muted-foreground))'>
                                    {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </text>
                            );
                        }
                        return null;
                    })}
                </svg>
            </div>
        );
    };

    // Category breakdown chart
    const renderCategoryBreakdown = () => {
        if (!history.length) return null;

        const latestEntry = history[0]; // Most recent entry
        const auditData = latestEntry.audit_data || {};

        const categories = {
            Self: ['spirituality_score', 'mindset_mental_health_score', 'emotional_mastery_score', 'intellectual_growth_score', 'identity_self_image_score'],
            Body: ['physical_health_score', 'fitness_strength_score', 'nutrition_recovery_score', 'appearance_style_score', 'vitality_sexual_health_score'],
            Relationships: ['romantic_relationship_score', 'family_score', 'friendships_brotherhood_score', 'networking_social_status_score', 'contribution_to_others_score'],
            'Work & Wealth': ['career_mission_score', 'financial_health_score', 'skills_competence_score', 'business_entrepreneurship_score', 'time_management_productivity_score'],
            Lifestyle: ['home_living_environment_score', 'adventure_play_score', 'creativity_expression_score', 'freedom_autonomy_score', 'legacy_long_term_vision_score'],
        };

        const categoryAverages = Object.entries(categories).map(([name, fields]) => {
            const scores = fields.map((field) => auditData[field] || 1);
            const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            const percentage = (average / 34) * 100; // 34 is max Fibonacci value
            return { name, average, percentage };
        });

        return (
            <div className='space-y-4'>
                {categoryAverages.map((category) => (
                    <div key={category.name} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <span className='font-medium'>{category.name}</span>
                            <span className='text-sm text-muted-foreground'>{category.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={category.percentage} className='h-2' />
                    </div>
                ))}
            </div>
        );
    };

    const getInterpretation = (score: number) => {
        if (score < 20) return { label: 'Critical', color: 'destructive' };
        if (score < 40) return { label: 'Fragile', color: 'secondary' };
        if (score < 60) return { label: 'Stable', color: 'outline' };
        if (score < 80) return { label: 'Strong', color: 'default' };
        return { label: 'Exceptional', color: 'default', className: 'bg-green-600' };
    };

    return (
        <div className='space-y-6'>
            {/* Controls */}
            <div className='flex flex-wrap items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                    <Button variant={viewType === 'overview' ? 'default' : 'outline'} size='sm' onClick={() => setViewType('overview')}>
                        <BarChart3 className='mr-1 h-4 w-4' />
                        Overview
                    </Button>
                    <Button variant={viewType === 'trends' ? 'default' : 'outline'} size='sm' onClick={() => setViewType('trends')}>
                        <TrendingUp className='mr-1 h-4 w-4' />
                        Trends
                    </Button>
                    <Button variant={viewType === 'categories' ? 'default' : 'outline'} size='sm' onClick={() => setViewType('categories')}>
                        <Target className='mr-1 h-4 w-4' />
                        Categories
                    </Button>
                </div>

                <div className='flex items-center gap-1'>
                    {['7d', '30d', '90d', 'all'].map((timeframe) => (
                        <Button key={timeframe} variant={selectedTimeframe === timeframe ? 'default' : 'outline'} size='sm' onClick={() => setSelectedTimeframe(timeframe as any)}>
                            {timeframe === 'all' ? 'All Time' : timeframe.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <Card className='p-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Current</p>
                                <p className='text-2xl font-bold'>{stats.latest.toFixed(1)}%</p>
                            </div>
                            <Badge variant={getInterpretation(stats.latest).color as any} className={getInterpretation(stats.latest).className}>
                                {getInterpretation(stats.latest).label}
                            </Badge>
                        </div>
                    </Card>

                    <Card className='p-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Change</p>
                                <p className={`text-2xl font-bold ${stats.trend === 'up' ? 'text-green-600' : stats.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                                    {stats.change > 0 ? '+' : ''}
                                    {stats.change.toFixed(1)}%
                                </p>
                            </div>
                            {stats.trend === 'up' ? (
                                <TrendingUp className='h-5 w-5 text-green-600' />
                            ) : stats.trend === 'down' ? (
                                <TrendingDown className='h-5 w-5 text-red-600' />
                            ) : (
                                <span className='h-5 w-5' />
                            )}
                        </div>
                    </Card>

                    <Card className='p-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Average</p>
                            <p className='text-2xl font-bold'>{stats.average.toFixed(1)}%</p>
                        </div>
                    </Card>

                    <Card className='p-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Range</p>
                            <p className='text-2xl font-bold'>
                                {stats.min.toFixed(1)}% - {stats.max.toFixed(1)}%
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            {viewType === 'overview' && (
                <Card className='p-6'>
                    <h4 className='mb-4 font-semibold'>Life Magnitude Trend</h4>
                    {renderTrendChart()}
                </Card>
            )}

            {viewType === 'trends' && (
                <div className='space-y-4'>
                    <Card className='p-6'>
                        <h4 className='mb-4 font-semibold'>Progress Trend</h4>
                        {renderTrendChart()}
                    </Card>

                    <Card className='p-6'>
                        <h4 className='mb-4 font-semibold'>Recent Activity</h4>
                        <div className='space-y-3'>
                            {filteredHistory.slice(0, 10).map((entry) => (
                                <div key={entry.id} className='flex items-center justify-between border-b pb-2 last:border-b-0'>
                                    <div className='flex items-center gap-3'>
                                        <Calendar className='h-4 w-4 text-muted-foreground' />
                                        <span className='text-sm text-muted-foreground'>{new Date(entry.created_at).toLocaleDateString()}</span>
                                        <span className='text-sm'>{entry.change_summary || 'Updated scores'}</span>
                                    </div>
                                    <Badge variant={getInterpretation(entry.composite_percentage || 0).color as any}>{(entry.composite_percentage || 0).toFixed(1)}%</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {viewType === 'categories' && (
                <Card className='p-6'>
                    <h4 className='mb-4 font-semibold'>Category Breakdown</h4>
                    {renderCategoryBreakdown()}
                </Card>
            )}
        </div>
    );
}
