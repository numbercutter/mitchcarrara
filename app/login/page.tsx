'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Shield } from 'lucide-react';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                router.push('/dashboard');
            } else {
                setError('Incorrect password');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-background p-4'>
            {/* Background Pattern */}
            <div className='absolute inset-0 bg-[linear-gradient(to_right,#4f46e5,#3b82f6,#4f46e5)] opacity-10' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-background/50 to-background' />

            {/* Animated Background Elements */}
            <div className='absolute inset-0'>
                <div className='absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-3xl' />
                <div className='absolute -right-4 bottom-1/4 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-3xl' />
            </div>

            {/* Main Content */}
            <div className='relative w-full max-w-md space-y-8 rounded-2xl bg-card p-8 backdrop-blur-xl'>
                <div className='text-center'>
                    <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary p-1'>
                        <div className='flex h-full w-full items-center justify-center rounded-full bg-card'>
                            <Shield className='h-8 w-8 text-primary' />
                        </div>
                    </div>
                    <h2 className='mt-6 text-3xl font-bold tracking-tight text-foreground'>Admin Portal</h2>
                    <p className='mt-2 text-sm text-muted-foreground'>Enter your password to continue</p>
                </div>

                <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
                    <div className='space-y-4'>
                        <div>
                            <label htmlFor='password' className='sr-only'>
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    id='password'
                                    name='password'
                                    type='password'
                                    required
                                    className='block w-full rounded-lg border-0 bg-card/5 py-3 pl-4 pr-10 text-foreground ring-1 ring-inset ring-card/10 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6'
                                    placeholder='Enter password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                                    <Lock className='h-5 w-5 text-card/20' />
                                </div>
                            </div>
                        </div>

                        {error && <div className='rounded-lg bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-inset ring-red-500/20'>{error}</div>}
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-primary to-primary px-3 py-3 text-sm font-semibold text-foreground shadow-lg shadow-primary/25 transition-all hover:from-primary hover:to-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'>
                            {isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
