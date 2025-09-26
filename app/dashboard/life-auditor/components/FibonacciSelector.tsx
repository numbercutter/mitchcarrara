'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FibonacciValue {
    value: number;
    label: string;
    description: string;
}

interface FibonacciSelectorProps {
    value: number;
    onChange: (value: number) => void;
    fibonacciValues: FibonacciValue[];
    areaKey?: string;
    detailedDescriptions?: Record<string, Record<number, string>>;
}

export default function FibonacciSelector({ value, onChange, fibonacciValues, areaKey, detailedDescriptions }: FibonacciSelectorProps) {
    const [showDetails, setShowDetails] = useState(false);
    const getColorForValue = (fibValue: number, currentValue: number) => {
        if (fibValue === currentValue) {
            if (fibValue <= 3) return 'destructive';
            if (fibValue <= 8) return 'secondary';
            if (fibValue <= 13) return 'default';
            return 'default bg-green-600 hover:bg-green-700';
        }
        return 'outline';
    };

    const getButtonClass = (fibValue: number, currentValue: number) => {
        const baseClass = 'h-8 min-w-[2.5rem] text-xs';
        if (fibValue === currentValue) {
            if (fibValue <= 3) return `${baseClass} bg-red-600 hover:bg-red-700 text-white border-red-600`;
            if (fibValue <= 8) return `${baseClass} bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600`;
            if (fibValue <= 13) return `${baseClass} bg-blue-600 hover:bg-blue-700 text-white border-blue-600`;
            return `${baseClass} bg-green-600 hover:bg-green-700 text-white border-green-600`;
        }
        return `${baseClass} text-muted-foreground hover:text-foreground`;
    };

    // Get detailed description for current area and value
    const getDetailedDescription = (fibValue: number) => {
        if (!areaKey || !detailedDescriptions || !detailedDescriptions[areaKey]) {
            return fibonacciValues.find((f) => f.value === fibValue)?.description || '';
        }
        return detailedDescriptions[areaKey][fibValue] || '';
    };

    const currentLabel = fibonacciValues.find((f) => f.value === value)?.label || 'Unknown';
    const currentDetailedDescription = getDetailedDescription(value);

    return (
        <div className='space-y-2'>
            <div className='flex flex-wrap gap-1'>
                {fibonacciValues.map((fib) => (
                    <Button
                        key={fib.value}
                        variant={getColorForValue(fib.value, value) as any}
                        size='sm'
                        className={getButtonClass(fib.value, value)}
                        onClick={() => onChange(fib.value)}
                        title={getDetailedDescription(fib.value)}>
                        {fib.value}
                    </Button>
                ))}
            </div>

            <div className='flex items-center justify-between'>
                <div className='text-xs text-muted-foreground'>
                    Current: <span className='font-medium'>{currentLabel}</span>
                </div>
                {areaKey && detailedDescriptions && (
                    <Button variant='ghost' size='sm' onClick={() => setShowDetails(!showDetails)} className='h-6 px-2 text-xs'>
                        {showDetails ? <ChevronUp className='h-3 w-3' /> : <ChevronDown className='h-3 w-3' />}
                        {showDetails ? 'Hide' : 'Show'} Details
                    </Button>
                )}
            </div>

            {showDetails && areaKey && detailedDescriptions && (
                <Card className='space-y-2 bg-muted/30 p-3'>
                    <div className='text-xs font-medium text-primary'>Level Descriptions for {areaKey.replace('_score', '').replace(/_/g, ' ')}:</div>
                    <div className='max-h-48 space-y-1.5 overflow-y-auto'>
                        {fibonacciValues.map((fib) => (
                            <div
                                key={fib.value}
                                className={`rounded border-l-2 p-2 text-xs ${
                                    fib.value === value ? 'border-l-primary bg-primary/10 font-medium' : 'border-l-muted-foreground/30 bg-background/50'
                                }`}>
                                <div className='flex items-start gap-2'>
                                    <span className={`min-w-[1.5rem] font-mono font-bold ${fib.value === value ? 'text-primary' : 'text-muted-foreground'}`}>{fib.value}</span>
                                    <div>
                                        <div className={`font-medium ${fib.value === value ? 'text-primary' : ''}`}>{fib.label}</div>
                                        <div className='mt-0.5 text-muted-foreground'>{getDetailedDescription(fib.value)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {!showDetails && currentDetailedDescription && (
                <div className='rounded border-l-2 border-l-primary/50 bg-muted/20 p-2 text-xs text-muted-foreground'>
                    <span className='font-medium'>Current level:</span> {currentDetailedDescription}
                </div>
            )}
        </div>
    );
}
