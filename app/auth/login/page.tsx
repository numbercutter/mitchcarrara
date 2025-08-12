'use client';
import { createClient } from '@/lib/supabase/client';
import { getURL } from '@/utils/helpers';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function useSignInWithEmail() {
    const supabase = createClient();

    return async (email: string) => {
        const redirectURL = getURL('/api/auth/callback?next=/dashboard');

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: redirectURL,
            },
        });

        return { error };
    };
}

const AuroraBackground = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{
            opacity: 0.3,
            backgroundPosition: ['0% 50%, 0% 50%', '100% 50%, 100% 50%'],
            filter: 'blur(30px)',
        }}
        transition={{
            backgroundPosition: {
                duration: 60,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
            },
        }}
        className={`pointer-events-none absolute inset-0 overflow-hidden backdrop-blur-[100px] will-change-transform [--aurora:repeating-linear-gradient(100deg,rgba(59,130,246,0.3)_10%,rgba(99,102,241,0.2)_15%,rgba(147,197,253,0.3)_20%,rgba(167,139,250,0.2)_25%,rgba(96,165,250,0.3)_30%)] [--white-gradient:repeating-linear-gradient(100deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.05)_16%)] [background-image:var(--white-gradient),var(--aurora)] [background-position:0%_50%,0%_50%] [background-size:200%,_200%] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] after:absolute after:inset-0 after:animate-[aurora_15s_linear_infinite] after:[background-attachment:fixed] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_200%]`}
    />
);

const StarField = () => {
    const [mounted, setMounted] = useState(false);
    const [stars, setStars] = useState<
        Array<{
            id: number;
            x: number;
            y: number;
            size: number;
            duration: number;
            delay: number;
        }>
    >([]);

    useEffect(() => {
        const generateStars = () => {
            const newStars = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: 1 + Math.random() * 2,
                duration: 15 + Math.random() * 20,
                delay: Math.random() * -15,
            }));
            setStars(newStars);
        };

        generateStars();
        setMounted(true);

        const handleResize = () => {
            generateStars();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) return null;

    return (
        <div className='absolute inset-0 overflow-hidden'>
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    initial={{
                        opacity: 0.1,
                        x: star.x,
                        y: star.y,
                    }}
                    animate={{
                        opacity: [0.1, 0.5, 0.1],
                        y: [star.y, -100],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: star.delay,
                    }}
                    className='absolute'>
                    <div
                        style={{
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                        }}
                        className='rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default function SignIn() {
    const signInWithEmail = useSignInWithEmail();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const { error } = await signInWithEmail(email);
            if (error) {
                if (error.message?.includes('already in use')) {
                    setMessage('This email is already registered with a different sign-in method. Please use Google sign-in instead.');
                } else {
                    setMessage('Error sending login link. Please try again.');
                }
            } else {
                setMessage('Check your email for the login link!');
                setEmail('');
            }
        } catch (error) {
            setMessage('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='relative min-h-screen w-full overflow-hidden bg-black'>
            <div className='absolute inset-0 bg-gradient-to-b from-black via-black/10 via-black/20 via-black/40 via-black/60 via-black/80 to-transparent' />
            <AuroraBackground />
            <StarField />

            <div className='relative flex min-h-screen flex-col items-center justify-center px-6 py-16'>
                <div className='w-full max-w-[400px] space-y-12 sm:max-w-[380px] lg:w-[420px] lg:max-w-lg'>
                    <div className='space-y-4'>
                        <div className='space-y-3'>
                            <h1 className='font-russo bg-gradient-to-br text-4xl font-bold text-white sm:text-5xl lg:text-5xl'>mitchcarrara.com</h1>
                            <p className='font-outfit primary-text/90 max-w-[90%] text-base sm:text-lg'>Welcome to my personal dashboard. Sign in with your email to continue.</p>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <form onSubmit={handleEmailSignIn} className='mb-4'>
                            <div className='space-y-2'>
                                <input
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='Enter your email'
                                    className='font-outfit placeholder:primary-text w-full rounded-lg bg-[#1C1E23] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neutral-500/20'
                                    required
                                />
                                <button
                                    type='submit'
                                    disabled={isLoading}
                                    className='group relative w-full overflow-hidden rounded-lg bg-[#1C1E23] p-[1px] transition-all duration-300 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-neutral-500/20 active:scale-[0.99]'>
                                    <span className='relative flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 font-mono text-base font-medium text-neutral-900 shadow-[inset_0_1px_1px_rgba(0,0,0,0.075),inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:bg-neutral-100 lg:py-2.5'>
                                        <div className='absolute inset-0 -translate-x-full animate-[shine-loop_5s_ease-in-out_infinite] bg-[linear-gradient(-60deg,transparent_0%,transparent_25%,rgba(229,231,235,0.9)_35%,rgba(229,231,235,0.9)_45%,transparent_75%,transparent_100%)] group-hover:animate-[shine-loop_5s_ease-in-out_infinite]' />
                                        <span className='font-outfit relative text-base sm:text-base'>{isLoading ? 'Sending...' : 'Send Magic Link'}</span>
                                    </span>
                                </button>
                            </div>
                            {message && <p className='primary-text mt-2 text-center text-sm'>{message}</p>}
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shine-loop {
                    0% {
                        transform: translateX(-200%);
                    }
                    100% {
                        transform: translateX(200%);
                    }
                }
            `}</style>
        </div>
    );
}
