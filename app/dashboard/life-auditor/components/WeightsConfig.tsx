'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeightsConfigProps {
    initialWeights: any;
    onWeightsChange: (weights: any) => void;
    lifeAreas: Record<string, Array<{ key: string; label: string; description: string }>>;
}

export default function WeightsConfig({ initialWeights, onWeightsChange, lifeAreas }: WeightsConfigProps) {
    const [weights, setWeights] = useState(initialWeights || {});
    const [isSaving, setIsSaving] = useState(false);

    // Initialize weights with equal distribution if not provided
    useEffect(() => {
        if (!initialWeights) {
            const allAreas = Object.values(lifeAreas).flat();
            const equalWeight = 1.0 / allAreas.length;
            const defaultWeights: Record<string, number> = {};

            allAreas.forEach((area) => {
                defaultWeights[area.key.replace('_score', '_weight')] = equalWeight;
            });

            setWeights(defaultWeights);
        }
    }, [initialWeights, lifeAreas]);

    const updateWeight = (key: string, value: number) => {
        const newWeights = { ...weights, [key]: value };
        setWeights(newWeights);
    };

    const resetToEqual = () => {
        const allAreas = Object.values(lifeAreas).flat();
        const equalWeight = 1.0 / allAreas.length;
        const equalWeights: Record<string, number> = {};

        allAreas.forEach((area) => {
            equalWeights[area.key.replace('_score', '_weight')] = equalWeight;
        });

        setWeights(equalWeights);
    };

    const saveWeights = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/life-audits/weights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(weights),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save weights');
            }

            const savedWeights = await response.json();
            onWeightsChange(savedWeights);
        } catch (error) {
            console.error('Error saving weights:', error);
            alert(error instanceof Error ? error.message : 'Failed to save weights');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate total weight
    const totalWeight = (Object.values(weights) as any[]).reduce((sum: number, weight: any) => sum + (typeof weight === 'number' ? weight : 0), 0);
    const isValidTotal = Math.abs(totalWeight - 1.0) < 0.01;

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <p className='text-sm text-muted-foreground'>Customize the importance of each life area. Weights must sum to 1.0.</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Badge variant={isValidTotal ? 'default' : 'destructive'}>Total: {totalWeight.toFixed(3)}</Badge>
                    <Button variant='outline' size='sm' onClick={resetToEqual}>
                        Reset to Equal
                    </Button>
                    <Button onClick={saveWeights} disabled={isSaving || !isValidTotal} size='sm'>
                        {isSaving ? 'Saving...' : 'Save Weights'}
                    </Button>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6'>
                {Object.entries(lifeAreas).map(([category, areas]) => (
                    <Card key={category} className='p-4'>
                        <h3 className='mb-3 font-medium text-primary'>{category}</h3>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {areas.map((area) => {
                                const weightKey = area.key.replace('_score', '_weight');
                                const currentWeight = weights[weightKey] || 0;

                                return (
                                    <div key={area.key} className='space-y-2'>
                                        <Label className='text-xs'>{area.label}</Label>
                                        <div className='flex items-center space-x-2'>
                                            <Input
                                                type='number'
                                                min='0'
                                                max='1'
                                                step='0.01'
                                                value={currentWeight.toFixed(3)}
                                                onChange={(e) => updateWeight(weightKey, parseFloat(e.target.value) || 0)}
                                                className='h-8 text-xs'
                                            />
                                            <span className='text-xs text-muted-foreground'>{(currentWeight * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>

            {!isValidTotal && <div className='text-sm text-destructive'>⚠️ Weights must sum to exactly 1.0. Current total: {totalWeight.toFixed(3)}</div>}
        </div>
    );
}
