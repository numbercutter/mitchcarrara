'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Eye } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface UserProfile {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string;
    email_confirmed_at: string;
}

interface UserContext {
    isOwner: boolean;
    viewingOwnData: boolean;
    dataOwnerEmail: string;
    currentUserEmail: string;
}

export default function AccountPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [context, setContext] = useState<UserContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // Get current user profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfile({
                    id: user.id,
                    email: user.email || '',
                    created_at: user.created_at,
                    last_sign_in_at: user.last_sign_in_at || '',
                    email_confirmed_at: user.email_confirmed_at || ''
                });
            }

            // Get user context
            const contextResponse = await fetch('/api/user-context');
            if (contextResponse.ok) {
                const contextData = await contextResponse.json();
                setContext(contextData);
            }
        } catch (error) {
            setMessage('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        await supabase.auth.signOut();
        window.location.href = '/auth/login';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-lg">Loading account information...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    View your account information and access permissions.
                </p>
            </div>

            {message && (
                <div className="p-4 rounded-md bg-blue-50 text-blue-700">
                    {message}
                </div>
            )}

            {/* Current User Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Your Account
                    </CardTitle>
                    <CardDescription>
                        Information about your current login session.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {profile && (
                        <>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{profile.email}</span>
                                    {context?.isOwner && (
                                        <Badge variant="default">Owner</Badge>
                                    )}
                                    {!context?.isOwner && (
                                        <Badge variant="secondary">Assistant</Badge>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>User ID: {profile.id}</p>
                                    <p>Account created: {new Date(profile.created_at).toLocaleDateString()}</p>
                                    <p>Last sign in: {profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
                                    <p>Email confirmed: {profile.email_confirmed_at ? new Date(profile.email_confirmed_at).toLocaleDateString() : 'Not confirmed'}</p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Data Access Context */}
            {context && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Data Access
                        </CardTitle>
                        <CardDescription>
                            Information about whose data you're currently viewing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <div className="font-medium">Data Owner</div>
                                <div className="text-sm text-muted-foreground">
                                    {context.dataOwnerEmail}
                                </div>
                            </div>
                            {context.viewingOwnData ? (
                                <Badge variant="default">Your Data</Badge>
                            ) : (
                                <Badge variant="secondary">Shared Access</Badge>
                            )}
                        </div>
                        
                        {!context.viewingOwnData && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    You have been granted access to view {context.dataOwnerEmail.split('@')[0]}'s dashboard data.
                                    All data you see belongs to them, not your account.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Account Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Account Actions
                    </CardTitle>
                    <CardDescription>
                        Manage your account and session.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}