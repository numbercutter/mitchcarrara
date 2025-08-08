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
    realitydesigners: {
        id: 'realitydesigners',
        name: 'Reality Designers',
        slug: 'realitydesigners',
        description: 'Design Agency',
        logo: '/logos/realitydesigners-logo.png',
        supabase: {
            url: process.env.NEXT_PUBLIC_REALITYDESIGNERS_SUPABASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_REALITYDESIGNERS_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.REALITYDESIGNERS_SUPABASE_SERVICE_ROLE_KEY!,
        },
        stripe: {
            publishableKey: process.env.NEXT_PUBLIC_REALITYDESIGNERS_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.REALITYDESIGNERS_STRIPE_SECRET_KEY!,
            webhookSecret: process.env.REALITYDESIGNERS_STRIPE_WEBHOOK_SECRET!,
        },
        site: {
            url: process.env.NEXT_PUBLIC_REALITYDESIGNERS_SERVER_URL!,
            wsUrl: process.env.NEXT_PUBLIC_REALITYDESIGNERS_WS_URL!,
        },
    },
    protocoding: {
        id: 'protocoding',
        name: 'Protocoding',
        slug: 'protocoding',
        description: 'Software Studio',
        logo: '/logos/protocoding-logo.png',
        supabase: {
            url: process.env.NEXT_PUBLIC_PROTOCODING_SUPABASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_PROTOCODING_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.PROTOCODING_SUPABASE_SERVICE_ROLE_KEY!,
        },
        stripe: {
            publishableKey: process.env.NEXT_PUBLIC_PROTOCODING_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.PROTOCODING_STRIPE_SECRET_KEY!,
            webhookSecret: process.env.PROTOCODING_STRIPE_WEBHOOK_SECRET!,
        },
        site: {
            url: process.env.NEXT_PUBLIC_PROTOCODING_SERVER_URL!,
            wsUrl: process.env.NEXT_PUBLIC_PROTOCODING_WS_URL!,
        },
    },
    best2dayev3r: {
        id: 'best2dayev3r',
        name: 'Best2DayEv3r',
        slug: 'best2dayev3r',
        description: 'Lifestyle Brand',
        logo: '/logos/best2dayev3r-logo.png',
        supabase: {
            url: process.env.NEXT_PUBLIC_BEST2DAYEV3R_SUPABASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_BEST2DAYEV3R_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.BEST2DAYEV3R_SUPABASE_SERVICE_ROLE_KEY!,
        },
        stripe: {
            publishableKey: process.env.NEXT_PUBLIC_BEST2DAYEV3R_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.BEST2DAYEV3R_STRIPE_SECRET_KEY!,
            webhookSecret: process.env.BEST2DAYEV3R_STRIPE_WEBHOOK_SECRET!,
        },
        site: {
            url: process.env.NEXT_PUBLIC_BEST2DAYEV3R_SERVER_URL!,
            wsUrl: process.env.NEXT_PUBLIC_BEST2DAYEV3R_WS_URL!,
        },
    },
    ozaiq: {
        id: 'ozaiq',
        name: 'Ozaiq Agent Playground',
        slug: 'ozaiq',
        description: 'AI/Agentic Systems',
        logo: '/logos/ozaiq-logo.png',
        supabase: {
            url: process.env.NEXT_PUBLIC_OZAIQ_SUPABASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_OZAIQ_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.OZAIQ_SUPABASE_SERVICE_ROLE_KEY!,
        },
        stripe: {
            publishableKey: process.env.NEXT_PUBLIC_OZAIQ_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.OZAIQ_STRIPE_SECRET_KEY!,
            webhookSecret: process.env.OZAIQ_STRIPE_WEBHOOK_SECRET!,
        },
        site: {
            url: process.env.NEXT_PUBLIC_OZAIQ_SERVER_URL!,
            wsUrl: process.env.NEXT_PUBLIC_OZAIQ_WS_URL!,
        },
    },
    aforestrunningfaster: {
        id: 'aforestrunningfaster',
        name: 'A Forest Running Faster',
        slug: 'aforestrunningfaster',
        description: 'Music',
        logo: '/logos/aforestrunningfaster-logo.png',
        supabase: {
            url: process.env.NEXT_PUBLIC_AFORESTRUNNINGFASTER_SUPABASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_AFORESTRUNNINGFASTER_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.AFORESTRUNNINGFASTER_SUPABASE_SERVICE_ROLE_KEY!,
        },
        stripe: {
            publishableKey: process.env.NEXT_PUBLIC_AFORESTRUNNINGFASTER_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.AFORESTRUNNINGFASTER_STRIPE_SECRET_KEY!,
            webhookSecret: process.env.AFORESTRUNNINGFASTER_STRIPE_WEBHOOK_SECRET!,
        },
        site: {
            url: process.env.NEXT_PUBLIC_AFORESTRUNNINGFASTER_SERVER_URL!,
            wsUrl: process.env.NEXT_PUBLIC_AFORESTRUNNINGFASTER_WS_URL!,
        },
    },
    paintthief: {
        id: 'paintthief',
        name: 'Paint Thief',
        slug: 'paintthief',
        description: 'Digital Creator',
        logo: '/logos/paintthief-logo.png',
        supabase: {
            url: process.env.NEXT_PUBLIC_PAINTTHIEF_SUPABASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_PAINTTHIEF_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.PAINTTHIEF_SUPABASE_SERVICE_ROLE_KEY!,
        },
        stripe: {
            publishableKey: process.env.NEXT_PUBLIC_PAINTTHIEF_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.PAINTTHIEF_STRIPE_SECRET_KEY!,
            webhookSecret: process.env.PAINTTHIEF_STRIPE_WEBHOOK_SECRET!,
        },
        site: {
            url: process.env.NEXT_PUBLIC_PAINTTHIEF_SERVER_URL!,
            wsUrl: process.env.NEXT_PUBLIC_PAINTTHIEF_WS_URL!,
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
