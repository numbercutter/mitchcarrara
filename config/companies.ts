export interface CompanyConfig {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo: string;
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    };
    stripe: {
        publishableKey: string;
        secretKey: string;
        webhookSecret: string;
    };
    discord?: {
        clientId: string;
        clientSecret: string;
        botToken: string;
        guildId: string;
        paidRoleId: string;
        unpaidRoleId: string;
        redirectUri: string;
    };

    site: {
        url: string;
        wsUrl: string;
    };
}

export const companies: Record<string, CompanyConfig> = {
    rthmn: {
        id: 'rthmn',
        name: 'RTHMN',
        slug: 'rthmn',
        description: 'RTHMN Trading Platform',
        logo: '/logos/rthmn-logo.png',
        supabase: {
            url: process.env.NEXT_PUBLIC_RTHMN_SUPABASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_RTHMN_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.RTHMN_SUPABASE_SERVICE_ROLE_KEY!,
        },
        stripe: {
            publishableKey: process.env.NEXT_PUBLIC_RTHMN_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.RTHMN_STRIPE_SECRET_KEY!,
            webhookSecret: process.env.RTHMN_STRIPE_WEBHOOK_SECRET!,
        },
        discord: {
            clientId: process.env.NEXT_PUBLIC_RTHMN_DISCORD_CLIENT_ID!,
            clientSecret: process.env.RTHMN_DISCORD_CLIENT_SECRET!,
            botToken: process.env.RTHMN_DISCORD_BOT_TOKEN!,
            guildId: process.env.RTHMN_DISCORD_GUILD_ID!,
            paidRoleId: process.env.RTHMN_DISCORD_PAID_ROLE_ID!,
            unpaidRoleId: process.env.RTHMN_DISCORD_UNPAID_ROLE_ID!,
            redirectUri: process.env.NEXT_PUBLIC_RTHMN_DISCORD_REDIRECT_URI!,
        },

        site: {
            url: process.env.NEXT_PUBLIC_RTHMN_SERVER_URL!,
            wsUrl: process.env.NEXT_PUBLIC_RTHMN_WS_URL!,
        },
    },
    secondisc: {
        id: 'secondisc',
        name: 'SeconDisc',
        slug: 'secondisc',
        description: 'SeconDisc Smart Tech',
        logo: '/logos/secondisc-logo.png',
        supabase: {
            url: process.env.NEXT_PUBLIC_SECONDISC_SUPABASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_SECONDISC_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.SECONDISC_SUPABASE_SERVICE_ROLE_KEY!,
        },
        stripe: {
            publishableKey: process.env.NEXT_PUBLIC_SECONDISC_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.SECONDISC_STRIPE_SECRET_KEY!,
            webhookSecret: process.env.SECONDISC_STRIPE_WEBHOOK_SECRET!,
        },
        site: {
            url: process.env.NEXT_PUBLIC_SECONDISC_SERVER_URL!,
            wsUrl: process.env.NEXT_PUBLIC_SECONDISC_WS_URL!,
        },
    },
};

export type CompanyId = keyof typeof companies;

export function getCompanyConfig(companyId: string): CompanyConfig {
    const config = companies[companyId as CompanyId];
    if (!config) {
        throw new Error(`Company configuration not found for ID: ${companyId}`);
    }
    return config;
}

export function getAllCompanyConfigs(): CompanyConfig[] {
    return Object.values(companies);
}
