'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, Image, Type } from 'lucide-react';

interface VisionCard {
    id: string;
    type: 'image' | 'text';
    content: string;
    title: string;
    position: { x: number; y: number };
}

export default function VisionBoardPage() {
    const [cards, setCards] = useState<VisionCard[]>([
        {
            id: '1',
            type: 'text',
            title: 'Career Goals',
            content: 'Build successful tech companies and help entrepreneurs achieve their dreams',
            position: { x: 20, y: 20 }
        },
        {
            id: '2',
            type: 'text',
            title: 'Personal Growth',
            content: 'Continuous learning, health optimization, and meaningful relationships',
            position: { x: 320, y: 20 }
        },
        {
            id: '3',
            type: 'text',
            title: '5-Year Vision',
            content: 'Multiple profitable companies, financial freedom, and positive impact on thousands of lives',
            position: { x: 20, y: 220 }
        }
    ]);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');

    const addCard = (type: 'image' | 'text') => {
        const newCard: VisionCard = {
            id: Date.now().toString(),
            type,
            title: type === 'image' ? 'New Image' : 'New Goal',
            content: type === 'image' ? '' : 'Enter your vision here...',
            position: { x: Math.random() * 400, y: Math.random() * 300 }
        };
        setCards([...cards, newCard]);
    };

    const startEdit = (card: VisionCard) => {
        setIsEditing(card.id);
        setEditTitle(card.title);
        setEditContent(card.content);
    };

    const saveEdit = () => {
        if (!isEditing) return;
        setCards(cards.map(card => 
            card.id === isEditing 
                ? { ...card, title: editTitle, content: editContent }
                : card
        ));
        setIsEditing(null);
        setEditTitle('');
        setEditContent('');
    };

    const deleteCard = (id: string) => {
        setCards(cards.filter(card => card.id !== id));
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
                    <button
                        onClick={() => addCard('text')}
                        className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                        <Type className='h-4 w-4' />
                        Add Text
                    </button>
                    <button
                        onClick={() => addCard('image')}
                        className='flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm hover:bg-secondary/50'>
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
                            transform: isEditing === card.id ? 'scale(1.02)' : 'scale(1)'
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
                                {card.type === 'text' ? (
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
                                    <button
                                        onClick={cancelEdit}
                                        className='px-3 py-1 text-xs text-muted-foreground hover:text-foreground'>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveEdit}
                                        className='rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90'>
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className='mb-2 flex items-center justify-between'>
                                    <h3 className='font-semibold text-foreground'>{card.title}</h3>
                                    <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                                        <button
                                            onClick={() => startEdit(card)}
                                            className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                            <Edit3 className='h-3 w-3' />
                                        </button>
                                        <button
                                            onClick={() => deleteCard(card.id)}
                                            className='rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'>
                                            <Trash2 className='h-3 w-3' />
                                        </button>
                                    </div>
                                </div>
                                
                                {card.type === 'text' ? (
                                    <p className='text-sm text-muted-foreground leading-relaxed'>{card.content}</p>
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
                                    <button
                                        onClick={() => deleteCard(card.id)}
                                        className='rounded-full bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20'>
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