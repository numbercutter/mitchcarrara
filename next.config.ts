/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        inlineCss: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                port: '',
                hostname: 'mcyjrazlwwmqjyhwzhcm.supabase.co',
                pathname: '/storage/v1/object/public/**',
                search: '',
            },
            {
                protocol: 'https',
                port: '',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/a/**',
                search: '',
            },
        ],
    },
};

module.exports = nextConfig;
