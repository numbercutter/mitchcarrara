'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    MessageSquare,
    Mail,
    Menu,
    X,
    Moon,
    Sun,
    Eye,
    Heart,
    CheckSquare,
    Calendar,
    Settings,
    Dumbbell,
    Book,
    BarChart,
    Users,
    FileText,
    Shield,
    Clock,
    LogOut,
    DollarSign,
    StickyNote,
} from 'lucide-react';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { CompanySelector } from '../components/CompanySelector';
import ChatSidebar from '../components/ChatSidebar';
import { createBrowserClient } from '@supabase/ssr';
import LogoutButton from '@/components/auth/LogoutButton';
import UserContextIndicator from './components/UserContextIndicator';

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vision Board', href: '/dashboard/vision', icon: Eye },
    { name: 'Notes', href: '/dashboard/notes', icon: StickyNote },
    {
        name: 'Personal',
        href: '/dashboard/personal',
        icon: Heart,
        children: [
            { name: 'Overview', href: '/dashboard/personal', icon: LayoutDashboard },
            { name: 'Health & Fitness', href: '/dashboard/personal/health', icon: Dumbbell },
            { name: 'Contacts', href: '/dashboard/personal/contacts', icon: Users },
            { name: 'Routines', href: '/dashboard/personal/routines', icon: Clock },
            { name: 'Documents', href: '/dashboard/personal/documents', icon: Shield },
            { name: 'Analytics', href: '/dashboard/personal/analytics', icon: BarChart },
        ],
    },
    {
        name: 'Tasks',
        href: '/dashboard/tasks',
        icon: CheckSquare,
        children: [
            { name: 'Overview', href: '/dashboard/tasks', icon: LayoutDashboard },
            { name: 'Manage Tasks', href: '/dashboard/tasks/manage', icon: CheckSquare },
            { name: 'Calendar', href: '/dashboard/tasks/calendar', icon: Calendar },
            { name: 'Billing', href: '/dashboard/tasks/billing', icon: DollarSign },
        ],
    },
    {
        name: 'Companies',
        href: '/dashboard/companies',
        icon: Building2,
        children: [
            { name: 'Overview', href: '/dashboard/companies', icon: LayoutDashboard },
            { name: 'Payments', href: '/dashboard/companies/payments', icon: CreditCard },
            { name: 'Discord', href: '/dashboard/companies/discord', icon: MessageSquare },
            { name: 'Support', href: '/dashboard/companies/support', icon: Mail },
        ],
    },
];

function useDarkMode() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // On mount, check localStorage or system preference
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);

    const toggle = () => {
        setIsDark((prev) => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return next;
        });
    };

    return [isDark, toggle] as const;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const [isDark, toggleDark] = useDarkMode();
    const isCompaniesRoute = pathname.startsWith('/dashboard/companies');

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            setIsAuthenticated(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='text-lg'>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const sidebarContent = (
        <>
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setSidebarOpen(false)} />
                <div className='fixed inset-y-0 left-0 flex w-64 flex-col border-r border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]'>
                    <div className='flex h-16 items-center justify-between border-b border-border/50 px-4'>
                        <span className='text-xl font-semibold tracking-tight text-foreground'>Dashboard</span>
                        <button onClick={() => setSidebarOpen(false)} className='text-foreground/70 hover:text-foreground'>
                            <X className='h-6 w-6' />
                        </button>
                    </div>
                    <div className='flex-1 space-y-1 px-2 py-4'>
                        {isCompaniesRoute && (
                            <div className='px-2 pb-4'>
                                <CompanySelector />
                            </div>
                        )}
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const hasChildren = item.children && item.children.length > 0;
                            const isChildActive = hasChildren && item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + '/'));
                            const showChildren = hasChildren && (isActive || isChildActive || pathname.startsWith(item.href + '/'));

                            return (
                                <div key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                                            isActive || isChildActive
                                                ? 'border border-primary/20 bg-primary/10 text-primary'
                                                : 'border border-transparent text-muted-foreground hover:border-border/50 hover:bg-secondary/50 hover:text-foreground'
                                        }`}>
                                        <item.icon className='mr-3 h-6 w-6' />
                                        {item.name}
                                    </Link>
                                    {showChildren && (
                                        <div className='ml-6 mt-1 space-y-1'>
                                            {item.children.map((child) => {
                                                const isChildItemActive = pathname === child.href;
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className={`group flex items-center rounded-md px-2 py-1 text-sm transition-colors ${
                                                            isChildItemActive ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                                                        }`}>
                                                        <child.icon className='mr-3 h-4 w-4' />
                                                        {child.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Account and Logout for mobile */}
                    <div className='space-y-2 border-t border-border/50 p-4'>
                        <Link
                            href='/dashboard/settings'
                            className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                                pathname.startsWith('/dashboard/settings')
                                    ? 'border border-primary/20 bg-primary/10 text-primary'
                                    : 'border border-transparent text-muted-foreground hover:border-border/50 hover:bg-secondary/50 hover:text-foreground'
                            }`}>
                            <Settings className='mr-3 h-5 w-5' />
                            Settings
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className='hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col'>
                <div className='flex min-h-0 flex-1 flex-col border-r border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]'>
                    <div className='flex h-16 items-center justify-between border-b border-border/50 px-4'>
                        <span className='text-xl font-semibold tracking-tight text-foreground'>Dashboard</span>
                        <button onClick={toggleDark} className='rounded-md p-2 text-foreground/70 hover:bg-secondary/50 hover:text-foreground'>
                            {isDark ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
                        </button>
                    </div>
                    <div className='flex-1 space-y-1 px-2 py-4'>
                        {isCompaniesRoute && (
                            <div className='px-2 pb-4'>
                                <CompanySelector />
                            </div>
                        )}
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const hasChildren = item.children && item.children.length > 0;
                            const isChildActive = hasChildren && item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + '/'));
                            const showChildren = hasChildren && (isActive || isChildActive || pathname.startsWith(item.href + '/'));

                            return (
                                <div key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                                            isActive || isChildActive
                                                ? 'border border-primary/20 bg-primary/10 text-primary'
                                                : 'border border-transparent text-muted-foreground hover:border-border/50 hover:bg-secondary/50 hover:text-foreground'
                                        }`}>
                                        <item.icon className='mr-3 h-6 w-6' />
                                        {item.name}
                                    </Link>
                                    {showChildren && (
                                        <div className='ml-6 mt-1 space-y-1'>
                                            {item.children.map((child) => {
                                                const isChildItemActive = pathname === child.href;
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className={`group flex items-center rounded-md px-2 py-1 text-sm transition-colors ${
                                                            isChildItemActive ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                                                        }`}>
                                                        <child.icon className='mr-3 h-4 w-4' />
                                                        {child.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Settings and Logout for desktop */}
                    <div className='space-y-2 border-t border-border/50 p-4'>
                        <Link
                            href='/dashboard/settings'
                            className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                                pathname.startsWith('/dashboard/settings')
                                    ? 'border border-primary/20 bg-primary/10 text-primary'
                                    : 'border border-transparent text-muted-foreground hover:border-border/50 hover:bg-secondary/50 hover:text-foreground'
                            }`}>
                            <Settings className='mr-3 h-5 w-5' />
                            Settings
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </>
    );

    const mainContent = (
        <>
            {sidebarContent}

            {/* Main content */}
            <div className={`transition-all duration-300 lg:pl-64 ${chatSidebarOpen ? 'lg:pr-80' : ''}`}>
                {/* Top header */}
                <div className='sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-gradient-to-br from-background via-background/95 to-background/90 px-4 shadow-sm backdrop-blur-sm'>
                    <button onClick={() => setSidebarOpen(true)} className='rounded-md p-2 text-foreground/70 hover:bg-secondary/50 hover:text-foreground lg:hidden'>
                        <Menu className='h-6 w-6' />
                    </button>
                    <div className='flex items-center gap-4'>
                        <UserContextIndicator />
                        <button
                            onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
                            className='rounded-md p-2 text-foreground/70 transition-colors hover:bg-secondary/50 hover:text-foreground'
                            title='Toggle Chat'>
                            <MessageSquare className='h-5 w-5' />
                        </button>
                        <button onClick={toggleDark} className='rounded-md p-2 text-foreground/70 hover:bg-secondary/50 hover:text-foreground lg:hidden'>
                            {isDark ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
                        </button>
                    </div>
                </div>

                {/* Page content */}
                <main className='flex h-[calc(100vh-4rem)] flex-col p-6'>{children}</main>
            </div>

            {/* Chat Sidebar */}
            <ChatSidebar isOpen={chatSidebarOpen} onToggle={() => setChatSidebarOpen(!chatSidebarOpen)} />
        </>
    );

    return (
        <div className='min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90'>
            {isCompaniesRoute ? <CompanyProvider>{mainContent}</CompanyProvider> : mainContent}
        </div>
    );
}
