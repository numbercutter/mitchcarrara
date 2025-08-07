import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
    title: 'Torpal',
    description: 'Multi-company support dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
            <body className={`${spaceGrotesk.className} antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
