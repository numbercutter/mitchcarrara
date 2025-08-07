'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Activity, Bot, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CompanyOverview } from '@/app/components/CompanyOverview';

interface DiscordData {
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

export default function DiscordPage() {
    const { selectedCompany } = useCompany();
    const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

    // Check if the selected company has Discord configuration
    const hasDiscordConfig = selectedCompany?.discord !== undefined;

    const { data: discordData, isLoading } = useQuery<DiscordData>({
        queryKey: ['discord', selectedCompany?.id],
        queryFn: async () => {
            const response = await fetch(`/api/discord/metrics?company=${selectedCompany?.id}`);
            if (!response.ok) throw new Error('Failed to fetch discord data');
            return response.json();
        },
        // Only enable the query if the company has Discord config
        enabled: !!selectedCompany && hasDiscordConfig,
    });

    const toggleMessage = (messageId: string) => {
        setExpandedMessages((prev) => {
            const next = new Set(prev);
            if (next.has(messageId)) {
                next.delete(messageId);
            } else {
                next.add(messageId);
            }
            return next;
        });
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='space-y-8'>
            <div>
                <h1 className='text-3xl font-bold'>Discord Overview</h1>
                <p className='mt-2 text-muted-foreground'>Discord metrics and activity across all companies.</p>
                <div className='mt-6'>
                    <CompanyOverview type='discord' />
                </div>
            </div>

            {selectedCompany && !hasDiscordConfig ? (
                <Card className='p-6'>
                    <div className='text-center'>
                        <h3 className='text-lg font-medium'>No Discord Integration</h3>
                        <p className='mt-2 text-muted-foreground'>{selectedCompany.name} does not have Discord integration configured.</p>
                    </div>
                </Card>
            ) : (
                <div className='space-y-4'>
                    <h2 className='text-2xl font-bold'>{selectedCompany?.name} Details</h2>

                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Total Members</CardTitle>
                                <Users className='h-4 w-4 text-muted-foreground' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>{discordData?.total_members.toLocaleString()}</div>
                                <div className='text-xs text-muted-foreground'>
                                    {discordData?.member_stats.paid} paid · {discordData?.member_stats.unpaid} unpaid
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Total Channels</CardTitle>
                                <Hash className='h-4 w-4 text-muted-foreground' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>{discordData?.total_channels}</div>
                                <div className='text-xs text-muted-foreground'>
                                    {discordData?.channels_by_type.text} text · {discordData?.channels_by_type.voice} voice
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Channel Categories</CardTitle>
                                <MessageSquare className='h-4 w-4 text-muted-foreground' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>{discordData?.channel_structure.length}</div>
                                <div className='text-xs text-muted-foreground'>Organized sections</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Active Channels</CardTitle>
                                <Activity className='h-4 w-4 text-muted-foreground' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>
                                    {
                                        discordData?.recent_activity.reduce((acc, curr) => {
                                            const channels = new Set(acc);
                                            channels.add(curr.channel);
                                            return Array.from(channels);
                                        }, [] as string[]).length
                                    }
                                </div>
                                <div className='text-xs text-muted-foreground'>With recent messages</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Channel Structure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    {discordData?.channel_structure.map((category) => (
                                        <div key={category.id} className='space-y-2'>
                                            <h3 className='text-sm font-semibold uppercase text-muted-foreground'>{category.name}</h3>
                                            <div className='space-y-1 pl-4'>
                                                {category.channels.map((channel) => (
                                                    <div key={channel.id} className='flex items-center gap-2 text-sm'>
                                                        {channel.type === 'text' ? <Hash className='h-4 w-4' /> : <MessageSquare className='h-4 w-4' />}
                                                        {channel.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-6'>
                                    {discordData?.recent_activity.map((activity) => {
                                        const isExpanded = expandedMessages.has(activity.id);
                                        const shouldTruncate = activity.content.length > 100;

                                        return (
                                            <div key={activity.id} className='relative space-y-2 border-b pb-4 last:border-0'>
                                                <div className='flex items-start justify-between gap-4'>
                                                    <div className='min-w-0 flex-1'>
                                                        <div className='flex items-center gap-2'>
                                                            <p className='truncate text-sm font-medium'>{activity.user}</p>
                                                            <p className='text-xs text-muted-foreground'>in #{activity.channel}</p>
                                                        </div>
                                                        <div className='relative mt-1'>
                                                            <div
                                                                className={cn(
                                                                    'relative transition-all duration-200 ease-in-out',
                                                                    !isExpanded && shouldTruncate && 'max-h-[48px] overflow-hidden'
                                                                )}>
                                                                <p className='whitespace-pre-wrap text-sm'>{activity.content}</p>
                                                                {!isExpanded && shouldTruncate && (
                                                                    <div className='absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent' />
                                                                )}
                                                            </div>
                                                            {shouldTruncate && (
                                                                <Button
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    className='mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-foreground'
                                                                    onClick={() => toggleMessage(activity.id)}>
                                                                    <span className='flex items-center gap-1'>
                                                                        {isExpanded ? (
                                                                            <>
                                                                                Show less <ChevronUp className='h-3 w-3' />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                Show more <ChevronDown className='h-3 w-3' />
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className='whitespace-nowrap text-xs text-muted-foreground'>
                                                        {new Date(activity.created_at).toLocaleString(undefined, {
                                                            month: 'numeric',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            hour12: true,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
