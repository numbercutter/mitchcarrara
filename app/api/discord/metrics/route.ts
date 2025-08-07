import { NextResponse } from 'next/server';
import { companies } from '@/config/companies';

const CHANNEL_TYPES = {
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    GUILD_CATEGORY: 4,
};

export async function GET(request: Request) {
    try {
        // Get company from query params or default to rthmn
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('company') || 'rthmn';
        const company = companies[companyId];

        if (!company?.discord) {
            throw new Error(`Discord configuration not found for company: ${companyId}`);
        }

        const { guildId, botToken } = company.discord;

        // Get guild information
        const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
            headers: {
                Authorization: `Bot ${botToken}`,
            },
        });

        if (!guildResponse.ok) {
            throw new Error('Failed to fetch guild data');
        }

        const guildData = await guildResponse.json();

        // Get guild channels
        const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
            headers: {
                Authorization: `Bot ${botToken}`,
            },
        });

        if (!channelsResponse.ok) {
            throw new Error('Failed to fetch channels data');
        }

        const channelsData = await channelsResponse.json();

        // Get guild members
        const membersResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
            headers: {
                Authorization: `Bot ${botToken}`,
            },
        });

        if (!membersResponse.ok) {
            throw new Error('Failed to fetch members data');
        }

        const membersData = await membersResponse.json();

        // Organize channels by category
        const categories = channelsData.filter((channel: any) => channel.type === CHANNEL_TYPES.GUILD_CATEGORY);
        const organizedChannels = categories.map((category: any) => {
            const categoryChannels = channelsData
                .filter((channel: any) => channel.parent_id === category.id)
                .map((channel: any) => ({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type === CHANNEL_TYPES.GUILD_TEXT ? 'text' : 'voice',
                    position: channel.position,
                }));

            return {
                id: category.id,
                name: category.name,
                channels: categoryChannels,
            };
        });

        // Get recent activity from key channels
        const keyChannels = ['updates', 'chat', 'help-and-questions'];
        let recentActivity = [];

        for (const channelName of keyChannels) {
            const channel = channelsData.find((c: any) => c.name === channelName && c.type === CHANNEL_TYPES.GUILD_TEXT);
            if (channel) {
                const messagesResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages?limit=5`, {
                    headers: {
                        Authorization: `Bot ${botToken}`,
                    },
                });

                if (messagesResponse.ok) {
                    const messagesData = await messagesResponse.json();
                    recentActivity = [
                        ...recentActivity,
                        ...messagesData.map((message: any) => ({
                            id: message.id,
                            type: 'message',
                            user: message.author.username,
                            content: message.content,
                            channel: channelName,
                            created_at: message.timestamp,
                        })),
                    ];
                }
            }
        }

        // Sort recent activity by timestamp
        recentActivity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        recentActivity = recentActivity.slice(0, 10);

        // Get member roles
        const paidMembers = membersData.filter((member: any) => member.roles.includes(company.discord.paidRoleId)).length;

        const unpaidMembers = membersData.filter((member: any) => member.roles.includes(company.discord.unpaidRoleId)).length;

        const metrics = {
            total_members: guildData.approximate_member_count || membersData.length,
            total_channels: channelsData.length,
            channels_by_type: {
                text: channelsData.filter((c: any) => c.type === CHANNEL_TYPES.GUILD_TEXT).length,
                voice: channelsData.filter((c: any) => c.type === CHANNEL_TYPES.GUILD_VOICE).length,
            },
            member_stats: {
                paid: paidMembers,
                unpaid: unpaidMembers,
                total: membersData.length,
            },
            channel_structure: organizedChannels,
            recent_activity: recentActivity,
        };

        return NextResponse.json(metrics);
    } catch (error) {
        console.error('Error fetching Discord metrics:', error);
        return NextResponse.json({ error: 'Failed to fetch Discord metrics' }, { status: 500 });
    }
}
