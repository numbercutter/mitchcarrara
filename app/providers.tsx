'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <CompanyProvider>{children}</CompanyProvider>
        </QueryClientProvider>
    );
}
