'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Settings, Shield, User } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your dashboard preferences and access controls.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Link href="/dashboard/settings/account">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Account
                            </CardTitle>
                            <CardDescription>
                                View your account information, data access permissions, and manage your session.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/settings/shared-access">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Shared Access
                            </CardTitle>
                            <CardDescription>
                                Manage who can access your dashboard data. Grant or revoke access to assistants and team members.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Card className="opacity-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            General Settings
                        </CardTitle>
                        <CardDescription>
                            Dashboard preferences, themes, and general configuration options. (Coming soon)
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="opacity-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Privacy & Security
                        </CardTitle>
                        <CardDescription>
                            Data privacy settings, security preferences, and access logs. (Coming soon)
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}