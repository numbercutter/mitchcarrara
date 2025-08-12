'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, Image, Type } from 'lucide-react';
import { Tables } from '@/types/database';

// Type helpers
type VisionCard = Tables<'vision_cards'>;

interface VisionClientProps {
    initialCards: VisionCard[];
}

interface LocalVisionCard extends VisionCard {
    position: { x: number; y: number };
}

export default function VisionClient({ initialCards }: VisionClientProps) {
    // Transform database cards to include position data from position_x and position_y
    const transformedCards: LocalVisionCard[] = initialCards.map((card) => ({
        ...card,
        position: {
            x: card.position_x || Math.random() * 400,
            y: card.position_y || Math.random() * 300,
        },
    }));

    const [cards, setCards] = useState<LocalVisionCard[]>(transformedCards);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');

    const addCard = async (type: 'image' | 'text') => {
        const position_x = Math.random() * 400;
        const position_y = Math.random() * 300;
        const newCard: LocalVisionCard = {
            id: Date.now().toString(),
            card_type: type,
            title: type === 'image' ? 'New Image' : 'New Goal',
            content: type === 'image' ? '' : 'Enter your vision here...',
            position: { x: position_x, y: position_y },
            position_x,
            position_y,
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
                    card_type: type,
                    title: newCard.title,
                    content: newCard.content,
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
        setEditContent(card.content);
    };

    const saveEdit = async () => {
        if (!isEditing) return;

        const titleToSave = editTitle;
        const contentToSave = editContent;
        const cardIdToUpdate = isEditing;

        // Optimistically update the UI
        const oldCards = cards;
        setCards(cards.map((card) => (card.id === isEditing ? { ...card, title: titleToSave, content: contentToSave, updated_at: new Date().toISOString() } : card)));
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
                    content: contentToSave,
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

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Vision Board</h1>
                    <p className='mt-2 text-muted-foreground'>Visualize your goals and dreams. Create a digital vision board to keep you motivated.</p>
                </div>
                <div className='flex gap-2'>
                    <button onClick={() => addCard('text')} className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                        <Type className='h-4 w-4' />
                        Add Text
                    </button>
                    <button onClick={() => addCard('image')} className='flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm hover:bg-secondary/50'>
                        <Image className='h-4 w-4' />
                        Add Image
                    </button>
                </div>
            </div>

            <div className='relative min-h-[600px] rounded-lg border bg-gradient-to-br from-card/50 to-card/80 p-6'>
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className='absolute w-72 rounded-lg border bg-card p-4 shadow-md transition-all hover:shadow-lg'
                        style={{
                            left: `${card.position.x}px`,
                            top: `${card.position.y}px`,
                            transform: isEditing === card.id ? 'scale(1.02)' : 'scale(1)',
                        }}>
                        {isEditing === card.id ? (
                            <div className='space-y-3'>
                                <input
                                    type='text'
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className='w-full rounded border bg-background px-3 py-2 text-sm font-semibold'
                                    placeholder='Card title...'
                                />
                                {card.card_type === 'text' ? (
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className='w-full resize-none rounded border bg-background px-3 py-2 text-sm'
                                        rows={4}
                                        placeholder='Enter your vision...'
                                    />
                                ) : (
                                    <input
                                        type='text'
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className='w-full rounded border bg-background px-3 py-2 text-sm'
                                        placeholder='Image URL...'
                                    />
                                )}
                                <div className='flex justify-end gap-2'>
                                    <button onClick={cancelEdit} className='px-3 py-1 text-xs text-muted-foreground hover:text-foreground'>
                                        Cancel
                                    </button>
                                    <button onClick={saveEdit} className='rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90'>
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className='mb-2 flex items-center justify-between'>
                                    <h3 className='font-semibold text-foreground'>{card.title}</h3>
                                    <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                                        <button onClick={() => startEdit(card)} className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                            <Edit3 className='h-3 w-3' />
                                        </button>
                                        <button onClick={() => deleteCard(card.id)} className='rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'>
                                            <Trash2 className='h-3 w-3' />
                                        </button>
                                    </div>
                                </div>

                                {card.card_type === 'text' ? (
                                    <p className='text-sm leading-relaxed text-muted-foreground'>{card.content}</p>
                                ) : (
                                    <div className='flex h-32 items-center justify-center rounded border-2 border-dashed border-border'>
                                        {card.content ? (
                                            <img src={card.content} alt={card.title} className='max-h-full max-w-full rounded' />
                                        ) : (
                                            <div className='text-center'>
                                                <Image className='mx-auto h-8 w-8 text-muted-foreground' />
                                                <p className='mt-1 text-xs text-muted-foreground'>Click edit to add image</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className='absolute -right-1 -top-1 flex gap-1 opacity-0 transition-opacity hover:opacity-100'>
                                    <button
                                        onClick={() => startEdit(card)}
                                        className='rounded-full bg-secondary p-1.5 text-muted-foreground hover:bg-secondary/80 hover:text-foreground'>
                                        <Edit3 className='h-3 w-3' />
                                    </button>
                                    <button onClick={() => deleteCard(card.id)} className='rounded-full bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20'>
                                        <Trash2 className='h-3 w-3' />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {cards.length === 0 && (
                    <div className='flex h-full items-center justify-center'>
                        <div className='text-center'>
                            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50'>
                                <Plus className='h-8 w-8 text-muted-foreground' />
                            </div>
                            <h3 className='text-lg font-semibold'>Start Your Vision Board</h3>
                            <p className='mt-1 text-sm text-muted-foreground'>Add text cards or images to visualize your goals</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
