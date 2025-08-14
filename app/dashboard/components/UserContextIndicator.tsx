'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Eye } from 'lucide-react';

interface UserContext {
    isOwner: boolean;
    viewingOwnData: boolean;
    dataOwnerEmail: string;
    currentUserEmail: string;
}

export default function UserContextIndicator() {
    const [context, setContext] = useState<UserContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchContext() {
            try {
                const response = await fetch('/api/user-context');
                const data = await response.json();
                setContext(data);
            } catch (error) {
                console.error('Error fetching user context:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchContext();
    }, []);

    if (isLoading || !context) {
        return null;
    }

    // Don't show indicator if user is viewing their own data
    if (context.viewingOwnData) {
        return null;
    }

    return (
        <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='flex items-center gap-1'>
                <Eye className='h-3 w-3' />
                Viewing {context.dataOwnerEmail?.split('@')[0] || 'user'}'s data
            </Badge>
        </div>
    );
}
