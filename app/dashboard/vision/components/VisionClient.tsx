'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Plus, Edit3, Trash2, Target, ArrowDown, CheckCircle, Circle, Grip } from 'lucide-react';
import { Tables } from '@/types/database';

// Type helpers
type VisionCard = Tables<'vision_cards'>;

interface VisionClientProps {
    initialCards: VisionCard[];
}

interface LocalVisionCard extends VisionCard {
    position: { x: number; y: number };
    hierarchy_level: 'vision' | 'goal' | 'milestone' | 'action';
    parent_id?: string;
    color?: string;
}

const HIERARCHY_CONFIG = {
    vision: {
        label: 'Vision',
        icon: Target,
        color: 'bg-purple-500',
        textColor: 'text-white',
        size: 'w-80 h-48',
        description: 'Your overarching vision or purpose'
    },
    goal: {
        label: 'Goal', 
        icon: CheckCircle,
        color: 'bg-blue-500',
        textColor: 'text-white',
        size: 'w-72 h-40',
        description: 'Major goals that support your vision'
    },
    milestone: {
        label: 'Milestone',
        icon: Circle,
        color: 'bg-green-500', 
        textColor: 'text-white',
        size: 'w-64 h-32',
        description: 'Key milestones towards your goals'
    },
    action: {
        label: 'Action',
        icon: ArrowDown,
        color: 'bg-orange-500',
        textColor: 'text-white', 
        size: 'w-56 h-28',
        description: 'Specific actions you can take'
    }
};

export default function VisionClient({ initialCards }: VisionClientProps) {
    // Transform database cards to include position data from position_x and position_y
    const transformedCards: LocalVisionCard[] = initialCards.map((card) => ({
        ...card,
        position: {
            x: card.position_x || Math.random() * 400,
            y: card.position_y || Math.random() * 300,
        },
        hierarchy_level: (card.content?.includes('hierarchy:') ? 
            card.content.split('hierarchy:')[1]?.split('|')[0] as any : 'goal') || 'goal',
        parent_id: card.content?.includes('parent:') ? 
            card.content.split('parent:')[1]?.split('|')[0] : undefined,
        color: card.content?.includes('color:') ? 
            card.content.split('color:')[1]?.split('|')[0] : undefined
    }));

    const [cards, setCards] = useState<LocalVisionCard[]>(transformedCards);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [draggedCard, setDraggedCard] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [showAddMenu, setShowAddMenu] = useState(false);
    const boardRef = useRef<HTMLDivElement>(null);

    const addCard = async (hierarchyLevel: 'vision' | 'goal' | 'milestone' | 'action', parentId?: string) => {
        const config = HIERARCHY_CONFIG[hierarchyLevel];
        setShowAddMenu(false);
        const position_x = Math.random() * (boardRef.current ? boardRef.current.offsetWidth - 300 : 400);
        const position_y = Math.random() * (boardRef.current ? boardRef.current.offsetHeight - 200 : 300);
        
        const contentData = `hierarchy:${hierarchyLevel}|${parentId ? `parent:${parentId}|` : ''}Enter your ${hierarchyLevel} here...`;
        
        const newCard: LocalVisionCard = {
            id: Date.now().toString(),
            card_type: 'text',
            title: `New ${config.label}`,
            content: contentData,
            position: { x: position_x, y: position_y },
            position_x,
            position_y,
            hierarchy_level: hierarchyLevel,
            parent_id: parentId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: 'user-1', // This would come from auth
        };

        setCards([...cards, newCard]);

        try {
            const response = await fetch('/api/vision-cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    card_type: 'text',
                    title: newCard.title,
                    content: contentData,
                    position_x,
                    position_y,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create vision card');
            }

            const savedCard = await response.json();
            // Update the temp card with the real data
            setCards((prev) =>
                prev.map((card) =>
                    card.id === newCard.id
                        ? {
                              ...savedCard,
                              position: { x: savedCard.position_x || position_x, y: savedCard.position_y || position_y },
                          }
                        : card
                )
            );
        } catch (error) {
            console.error('Error creating vision card:', error);
            // Remove the temp card on error
            setCards((prev) => prev.filter((card) => card.id !== newCard.id));
        }
    };

    const startEdit = (card: LocalVisionCard) => {
        setIsEditing(card.id);
        setEditTitle(card.title);
        // Extract the actual content without metadata
        const content = card.content || '';
        const cleanContent = content.includes('|') ? 
            content.split('|').slice(card.parent_id ? 2 : 1).join('|') : content;
        setEditContent(cleanContent);
    };

    const saveEdit = async () => {
        if (!isEditing) return;

        const titleToSave = editTitle;
        const contentToSave = editContent;
        const cardIdToUpdate = isEditing;
        
        const card = cards.find(c => c.id === isEditing);
        if (!card) return;
        
        // Reconstruct content with metadata
        const contentData = `hierarchy:${card.hierarchy_level}|${card.parent_id ? `parent:${card.parent_id}|` : ''}${contentToSave}`;

        // Optimistically update the UI
        const oldCards = cards;
        setCards(cards.map((card) => (card.id === isEditing ? { ...card, title: titleToSave, content: contentData, updated_at: new Date().toISOString() } : card)));
        setIsEditing(null);
        setEditTitle('');
        setEditContent('');

        try {
            const response = await fetch(`/api/vision-cards/${cardIdToUpdate}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: titleToSave,
                    content: contentData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update vision card');
            }

            // Success - the optimistic update is already correct
        } catch (error) {
            console.error('Error updating vision card:', error);
            // Revert the optimistic update
            setCards(oldCards);
            setIsEditing(cardIdToUpdate);
            setEditTitle(titleToSave);
            setEditContent(contentToSave);
        }
    };

    const deleteCard = async (id: string) => {
        // Optimistically update the UI
        const oldCards = cards;
        setCards(cards.filter((card) => card.id !== id));

        try {
            const response = await fetch(`/api/vision-cards/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete vision card');
            }

            // Success - the optimistic update is already correct
        } catch (error) {
            console.error('Error deleting vision card:', error);
            // Revert the optimistic update
            setCards(oldCards);
        }
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setEditTitle('');
        setEditContent('');
    };

    // Drag and drop handlers
    const handleMouseDown = useCallback((e: React.MouseEvent, cardId: string) => {
        if (isEditing) return;
        
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setDraggedCard(cardId);
        
        e.preventDefault();
    }, [cards, isEditing]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!draggedCard || !boardRef.current) return;
        
        const boardRect = boardRef.current.getBoundingClientRect();
        const newX = e.clientX - boardRect.left - dragOffset.x;
        const newY = e.clientY - boardRect.top - dragOffset.y;
        
        setCards(prev => prev.map(card => 
            card.id === draggedCard 
                ? { ...card, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
                : card
        ));
    }, [draggedCard, dragOffset]);

    const handleMouseUp = useCallback(async () => {
        if (!draggedCard) return;
        
        const card = cards.find(c => c.id === draggedCard);
        if (!card) return;
        
        // Save position to database
        try {
            await fetch(`/api/vision-cards/${draggedCard}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    position_x: card.position.x,
                    position_y: card.position.y
                })
            });
        } catch (error) {
            console.error('Error saving position:', error);
        }
        
        setDraggedCard(null);
    }, [draggedCard, cards]);

    // Add event listeners for drag
    React.useEffect(() => {
        if (draggedCard) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggedCard, handleMouseMove, handleMouseUp]);

    const getCleanContent = (card: LocalVisionCard) => {
        const content = card.content || '';
        return content.includes('|') ? 
            content.split('|').slice(card.parent_id ? 2 : 1).join('|') : content;
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Vision Board</h1>
                    <p className='mt-2 text-muted-foreground'>Visualize your goals and dreams. Create a digital vision board to keep you motivated.</p>
                </div>
                <div className='flex gap-2'>
                    <div className='relative'>
                        <button 
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'
                        >
                            <Plus className='h-4 w-4' />
                            Add Card
                        </button>
                        
                        {showAddMenu && (
                            <div className='absolute right-0 top-full mt-2 w-64 rounded-lg border bg-card p-2 shadow-lg z-10'>
                                <div className='space-y-1'>
                                    {Object.entries(HIERARCHY_CONFIG).map(([level, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={level}
                                                onClick={() => addCard(level as any)}
                                                className={`w-full flex items-center gap-3 rounded-md p-3 text-left hover:bg-secondary/50 transition-colors`}
                                            >
                                                <div className={`w-8 h-8 rounded ${config.color} flex items-center justify-center`}>
                                                    <Icon className='h-4 w-4 text-white' />
                                                </div>
                                                <div>
                                                    <div className='font-medium'>{config.label}</div>
                                                    <div className='text-xs text-muted-foreground'>{config.description}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div 
                ref={boardRef}
                className='relative min-h-[800px] rounded-lg border-2 border-dashed border-border/30 bg-gradient-to-br from-card/30 to-card/60 p-6 overflow-hidden'
                style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            >
                {cards.map((card) => {
                    const config = HIERARCHY_CONFIG[card.hierarchy_level] || HIERARCHY_CONFIG.goal;
                    const Icon = config.icon;
                    const isDragging = draggedCard === card.id;
                    
                    return (
                        <div
                            key={card.id}
                            className={`absolute ${config.size} rounded-lg border-2 ${config.color} shadow-lg transition-all cursor-move select-none ${
                                isDragging ? 'z-50 scale-105 shadow-2xl' : 'hover:shadow-xl'
                            } ${isEditing === card.id ? 'z-40' : ''}`}
                            style={{
                                left: `${card.position.x}px`,
                                top: `${card.position.y}px`,
                                transform: isEditing === card.id ? 'scale(1.02)' : isDragging ? 'scale(1.05)' : 'scale(1)',
                            }}
                            onMouseDown={(e) => handleMouseDown(e, card.id)}
                        >
                            {/* Drag Handle */}
                            <div className='absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity pointer-events-none'>
                                <Grip className='h-4 w-4 text-white' />
                            </div>
                            
                            {/* Hierarchy Badge */}
                            <div className='absolute top-2 left-2 flex items-center gap-1'>
                                <Icon className='h-4 w-4 text-white' />
                                <span className='text-xs font-medium text-white uppercase tracking-wide'>{config.label}</span>
                            </div>

                            {isEditing === card.id ? (
                                <div className='p-4 space-y-3 h-full'>
                                    <input
                                        type='text'
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className='w-full rounded border bg-white/90 px-3 py-2 text-sm font-semibold'
                                        placeholder='Card title...'
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className='w-full resize-none rounded border bg-white/90 px-3 py-2 text-sm flex-1'
                                        rows={config.size.includes('h-48') ? 6 : config.size.includes('h-40') ? 4 : 3}
                                        placeholder={`Enter your ${config.label.toLowerCase()}...`}
                                    />
                                    <div className='flex justify-end gap-2'>
                                        <button onClick={cancelEdit} className='px-3 py-1 text-xs text-white/80 hover:text-white bg-white/20 rounded'>
                                            Cancel
                                        </button>
                                        <button onClick={saveEdit} className='rounded bg-white/90 px-3 py-1 text-xs text-gray-900 hover:bg-white'>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className='p-4 h-full flex flex-col'>
                                    <div className='mt-6 mb-3'>
                                        <h3 className={`font-bold ${config.textColor} text-lg leading-tight`}>{card.title}</h3>
                                    </div>
                                    
                                    <div className='flex-1 overflow-hidden'>
                                        <p className={`text-sm leading-relaxed ${config.textColor} opacity-90`}>
                                            {getCleanContent(card)}
                                        </p>
                                    </div>

                                    <div className='absolute bottom-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity'>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEdit(card); }}
                                            className='rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors'
                                        >
                                            <Edit3 className='h-3 w-3' />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }} 
                                            className='rounded-full bg-red-500/80 p-1.5 text-white hover:bg-red-500 transition-colors'
                                        >
                                            <Trash2 className='h-3 w-3' />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {cards.length === 0 && (
                    <div className='flex h-full items-center justify-center'>
                        <div className='text-center max-w-md'>
                            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
                                <Target className='h-10 w-10 text-primary' />
                            </div>
                            <h3 className='text-xl font-bold mb-3'>Create Your Vision Board</h3>
                            <p className='text-muted-foreground mb-6'>Build a hierarchical whiteboard of your goals and visions. Start with your big picture vision, then add supporting goals, milestones, and action items.</p>
                            
                            <div className='grid grid-cols-2 gap-3 text-left'>
                                {Object.entries(HIERARCHY_CONFIG).map(([level, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <div key={level} className='flex items-center gap-2 p-2 rounded border bg-card'>
                                            <div className={`w-6 h-6 rounded ${config.color} flex items-center justify-center`}>
                                                <Icon className='h-3 w-3 text-white' />
                                            </div>
                                            <div className='text-xs'>
                                                <div className='font-medium'>{config.label}</div>
                                                <div className='text-muted-foreground text-[10px]'>{config.description}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Connection Lines (Future Enhancement) */}
                <svg className='absolute inset-0 pointer-events-none' style={{ zIndex: 1 }}>
                    {cards.map(card => {
                        if (!card.parent_id) return null;
                        const parent = cards.find(c => c.id === card.parent_id);
                        if (!parent) return null;
                        
                        const startX = parent.position.x + 150; // Center of parent card
                        const startY = parent.position.y + 80;
                        const endX = card.position.x + 150; // Center of child card  
                        const endY = card.position.y + 80;
                        
                        return (
                            <line
                                key={`${parent.id}-${card.id}`}
                                x1={startX}
                                y1={startY}
                                x2={endX}
                                y2={endY}
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeDasharray='5,5'
                                className='text-border opacity-40'
                            />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
