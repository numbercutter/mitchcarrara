'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Eye, Mail } from 'lucide-react';

interface SharedAccess {
    user_id: string;
    email: string;
    granted_at: string;
    permissions?: string[];
}

export default function SharedAccessPage() {
    const [sharedAccess, setSharedAccess] = useState<SharedAccess[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadSharedAccess();
    }, []);

    const loadSharedAccess = async () => {
        try {
            const response = await fetch('/api/shared-access');
            const data = await response.json();
            
            if (response.ok) {
                setSharedAccess(data.shared_access || []);
            } else {
                setMessage(data.error || 'Failed to load shared access');
            }
        } catch (error) {
            setMessage('Failed to load shared access');
        } finally {
            setLoading(false);
        }
    };

    const grantAccess = async () => {
        if (!newEmail.trim()) return;

        setActionLoading(true);
        try {
            const response = await fetch('/api/shared-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newEmail.trim() }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage(`Access granted to ${newEmail}`);
                setNewEmail('');
                setSharedAccess(data.shared_access || []);
            } else {
                setMessage(data.error || 'Failed to grant access');
            }
        } catch (error) {
            setMessage('Failed to grant access');
        } finally {
            setActionLoading(false);
        }
    };

    const revokeAccess = async (email: string) => {
        setActionLoading(true);
        try {
            const response = await fetch('/api/shared-access', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage(`Access revoked from ${email}`);
                setSharedAccess(data.shared_access || []);
            } else {
                setMessage(data.error || 'Failed to revoke access');
            }
        } catch (error) {
            setMessage('Failed to revoke access');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-lg">Loading shared access settings...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Shared Access</h1>
                <p className="text-muted-foreground">
                    Manage who can access your dashboard data. Users must sign up first before you can grant them access.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-md ${message.includes('Failed') || message.includes('error') 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                    {message}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Grant Access to New User
                    </CardTitle>
                    <CardDescription>
                        Enter the email address of someone you want to give access to your dashboard data.
                        They must have signed up/logged in at least once before you can grant access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <Input
                            type="email"
                            placeholder="assistant@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && grantAccess()}
                        />
                        <Button 
                            onClick={grantAccess}
                            disabled={!newEmail.trim() || actionLoading}
                        >
                            {actionLoading ? 'Granting...' : 'Grant Access'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Users with Access
                    </CardTitle>
                    <CardDescription>
                        People who can currently access your dashboard data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sharedAccess.length === 0 ? (
                        <p className="text-muted-foreground">No users have been granted access yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {sharedAccess.map((access) => (
                                <div key={access.email} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">{access.email}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Granted {new Date(access.granted_at).toLocaleDateString()}
                                                {access.user_id ? (
                                                    <Badge variant="secondary" className="ml-2">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="ml-2">Pending Login</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => revokeAccess(access.email)}
                                        disabled={actionLoading}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Revoke
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>How Shared Access Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Users must sign up and log in to the dashboard at least once before you can grant them access</p>
                    <p>• Once you grant access to an email, that user will see your data when they log in</p>
                    <p>• Users with access will see a badge indicating they're viewing your data</p>
                    <p>• You can revoke access at any time</p>
                    <p>• Users with "Pending Login" status have been granted access but haven't logged in since the grant</p>
                </CardContent>
            </Card>
        </div>
    );
}