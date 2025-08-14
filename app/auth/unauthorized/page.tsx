'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
                    <CardDescription>
                        Your email address is not authorized to access this dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        If you believe this is an error, please contact the system administrator to request access.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>numbercutter@protonmail.com</span>
                    </div>
                    <Button onClick={handleSignOut} variant="outline" className="w-full">
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}