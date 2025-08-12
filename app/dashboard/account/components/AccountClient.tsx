'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables } from '@/types/database';
import { User as UserIcon, Mail, Calendar, MapPin, Save, Loader2, Shield, Clock, Users, Plus, Trash2 } from 'lucide-react';

type UserProfile = Tables<'user_profiles'>;

interface AccountClientProps {
    user: User;
    initialProfile: UserProfile | null;
}

export default function AccountClient({ user, initialProfile }: AccountClientProps) {
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        full_name: initialProfile?.full_name || '',
        email: initialProfile?.email || user.email || '',
        timezone: initialProfile?.timezone || '',
        preferences: initialProfile?.preferences || {},
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [newAccessEmail, setNewAccessEmail] = useState('');
    const [newAccessLevel, setNewAccessLevel] = useState<'read' | 'write' | 'admin'>('read');

    const supabase = createClient();

    // Extract shared access from preferences
    const sharedAccess = (profile.preferences as any)?.shared_access || [];

    const handleSave = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const profileData = {
                user_id: user.id,
                full_name: profile.full_name || null,
                email: profile.email || null,
                timezone: profile.timezone || null,
                preferences: profile.preferences || {},
                updated_at: new Date().toISOString(),
            };

            if (initialProfile) {
                // Update existing profile
                const { error } = await supabase.from('user_profiles').update(profileData).eq('user_id', user.id);

                if (error) throw error;
            } else {
                // Create new profile
                const { error } = await supabase.from('user_profiles').insert({
                    ...profileData,
                    created_at: new Date().toISOString(),
                });

                if (error) throw error;
            }

            setMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Error updating profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof UserProfile, value: any) => {
        setProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleGrantAccess = async () => {
        if (!newAccessEmail.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/user-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'grant',
                    email: newAccessEmail,
                    accessLevel: newAccessLevel,
                }),
            });

            const result = await response.json();
            setMessage(result.message);

            if (result.success) {
                setNewAccessEmail('');
                // Refresh the page to show updated access list
                window.location.reload();
            }
        } catch (error) {
            setMessage('Error granting access');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeAccess = async (email: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'revoke',
                    email,
                }),
            });

            const result = await response.json();
            setMessage(result.message);

            if (result.success) {
                // Refresh the page to show updated access list
                window.location.reload();
            }
        } catch (error) {
            setMessage('Error revoking access');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            {/* Profile Information */}
            <Card className='p-6'>
                <div className='space-y-6'>
                    <div className='flex items-center gap-3'>
                        <UserIcon className='h-5 w-5' />
                        <h2 className='text-xl font-semibold'>Profile Information</h2>
                    </div>

                    <div className='grid gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='full_name'>Full Name</Label>
                            <Input
                                id='full_name'
                                value={profile.full_name || ''}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                placeholder='Enter your full name'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email Address</Label>
                            <Input
                                id='email'
                                type='email'
                                value={profile.email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder='Enter your email'
                            />
                            <p className='text-sm text-muted-foreground'>This is the email used for authentication</p>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='timezone'>Timezone</Label>
                            <Select value={profile.timezone || ''} onValueChange={(value) => handleInputChange('timezone', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select your timezone' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='America/New_York'>Eastern Time (ET)</SelectItem>
                                    <SelectItem value='America/Chicago'>Central Time (CT)</SelectItem>
                                    <SelectItem value='America/Denver'>Mountain Time (MT)</SelectItem>
                                    <SelectItem value='America/Los_Angeles'>Pacific Time (PT)</SelectItem>
                                    <SelectItem value='Europe/London'>London (GMT)</SelectItem>
                                    <SelectItem value='Europe/Paris'>Paris (CET)</SelectItem>
                                    <SelectItem value='Asia/Tokyo'>Tokyo (JST)</SelectItem>
                                    <SelectItem value='Australia/Sydney'>Sydney (AEST)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Account Details */}
            <Card className='p-6'>
                <div className='space-y-6'>
                    <div className='flex items-center gap-3'>
                        <Shield className='h-5 w-5' />
                        <h2 className='text-xl font-semibold'>Account Details</h2>
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>User ID</Label>
                            <div className='flex items-center gap-2'>
                                <code className='rounded bg-muted px-2 py-1 font-mono text-sm'>{user.id}</code>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>Account Created</Label>
                            <div className='flex items-center gap-2'>
                                <Calendar className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm'>{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>Last Sign In</Label>
                            <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm'>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>Email Verified</Label>
                            <div className='flex items-center gap-2'>
                                <Badge variant={user.email_confirmed_at ? 'default' : 'secondary'}>{user.email_confirmed_at ? 'Verified' : 'Pending'}</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Shared Access Management */}
            <Card className='p-6'>
                <div className='space-y-6'>
                    <div className='flex items-center gap-3'>
                        <Users className='h-5 w-5' />
                        <h2 className='text-xl font-semibold'>Shared Access</h2>
                    </div>

                    <p className='text-sm text-muted-foreground'>Grant others access to view your personal dashboard data. Perfect for assistants or family members.</p>

                    {/* Current Access List */}
                    {sharedAccess.length > 0 && (
                        <div className='space-y-3'>
                            <h3 className='text-sm font-medium'>Current Access</h3>
                            {sharedAccess.map((access: any, index: number) => (
                                <div key={index} className='flex items-center justify-between rounded-lg border p-3'>
                                    <div className='flex items-center gap-3'>
                                        <Mail className='h-4 w-4 text-muted-foreground' />
                                        <div>
                                            <p className='text-sm font-medium'>{access.email}</p>
                                            <p className='text-xs text-muted-foreground'>
                                                {access.access_level} access • granted {new Date(access.granted_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size='sm' variant='destructive' onClick={() => handleRevokeAccess(access.email)} disabled={isLoading}>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Grant New Access */}
                    <div className='space-y-4'>
                        <h3 className='text-sm font-medium'>Grant New Access</h3>
                        <div className='grid gap-4 md:grid-cols-3'>
                            <div className='md:col-span-1'>
                                <Label htmlFor='access_email'>Email Address</Label>
                                <Input
                                    id='access_email'
                                    type='email'
                                    value={newAccessEmail}
                                    onChange={(e) => setNewAccessEmail(e.target.value)}
                                    placeholder='assistant@example.com'
                                />
                            </div>

                            <div>
                                <Label htmlFor='access_level'>Access Level</Label>
                                <Select value={newAccessLevel} onValueChange={(value: any) => setNewAccessLevel(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='read'>Read Only</SelectItem>
                                        <SelectItem value='write'>Read & Write</SelectItem>
                                        <SelectItem value='admin'>Full Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex items-end'>
                                <Button onClick={handleGrantAccess} disabled={isLoading || !newAccessEmail.trim()}>
                                    <Plus className='mr-2 h-4 w-4' />
                                    Grant Access
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className='flex items-center justify-between'>
                <div>{message && <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}</div>
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
