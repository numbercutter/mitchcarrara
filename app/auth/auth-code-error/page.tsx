import Link from 'next/link';

export default function AuthCodeErrorPage() {
    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
            <div className='w-full max-w-md space-y-8 text-center'>
                <div>
                    <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Authentication Error</h2>
                    <p className='mt-2 text-sm text-gray-600'>There was an error processing your authentication request. The magic link may have expired or been used already.</p>
                </div>
                <div>
                    <Link
                        href='/auth/login'
                        className='group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
                        Try again
                    </Link>
                </div>
            </div>
        </div>
    );
}
