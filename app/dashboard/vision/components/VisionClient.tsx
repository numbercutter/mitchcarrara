'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Type, Square, Circle, Minus, MousePointer, Move, Trash2, Save } from 'lucide-react';
import { Tables } from '@/types/database';

type CanvasNote = Tables<'notes'>;

interface VisionClientProps {
    initialCards: CanvasNote[];
}

interface CanvasElement {
    id: string;
    type: 'text' | 'rect' | 'circle' | 'line';
    x: number;
    y: number;
    width?: number;
    height?: number;
    x2?: number; // for lines
    y2?: number; // for lines
    text?: string;
    fontSize?: number;
    color: string;
    strokeWidth: number;
    fill?: boolean;
}

type Tool = 'select' | 'text' | 'rect' | 'circle' | 'line';

export default function VisionClient({ initialCards }: VisionClientProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<Tool>('select');
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
    const [textValue, setTextValue] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load existing canvas data
    useEffect(() => {
        if (initialCards.length > 0) {
            const canvasNote = initialCards.find((note) => note.title === 'Vision Canvas');
            if (canvasNote && canvasNote.content) {
                try {
                    const savedElements = JSON.parse(canvasNote.content);
                    setElements(savedElements);
                } catch (error) {
                    console.error('Error loading canvas data:', error);
                }
            }
        }
    }, [initialCards]);

    // Redraw canvas whenever elements change
    useEffect(() => {
        redrawCanvas();
    }, [elements, selectedElement]);

    const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw elements
        elements.forEach((element) => {
            ctx.strokeStyle = element.color;
            ctx.fillStyle = element.color;
            ctx.lineWidth = element.strokeWidth;

            switch (element.type) {
                case 'rect':
                    if (element.fill) {
                        ctx.fillRect(element.x, element.y, element.width || 0, element.height || 0);
                    } else {
                        ctx.strokeRect(element.x, element.y, element.width || 0, element.height || 0);
                    }
                    break;

                case 'circle':
                    const radius = Math.sqrt((element.width || 0) ** 2 + (element.height || 0) ** 2) / 2;
                    ctx.beginPath();
                    ctx.arc(element.x + (element.width || 0) / 2, element.y + (element.height || 0) / 2, radius, 0, 2 * Math.PI);
                    if (element.fill) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    break;

                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(element.x, element.y);
                    ctx.lineTo(element.x2 || element.x, element.y2 || element.y);
                    ctx.stroke();
                    break;

                case 'text':
                    ctx.font = `${element.fontSize || 16}px Arial`;
                    ctx.fillText(element.text || '', element.x, element.y);
                    break;
            }

            // Draw selection outline
            if (selectedElement === element.id) {
                ctx.strokeStyle = '#007bff';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);

                const padding = 5;
                if (element.type === 'text') {
                    const metrics = ctx.measureText(element.text || '');
                    ctx.strokeRect(element.x - padding, element.y - (element.fontSize || 16) - padding, metrics.width + padding * 2, (element.fontSize || 16) + padding * 2);
                } else if (element.type === 'line') {
                    ctx.strokeRect(
                        Math.min(element.x, element.x2 || element.x) - padding,
                        Math.min(element.y, element.y2 || element.y) - padding,
                        Math.abs((element.x2 || element.x) - element.x) + padding * 2,
                        Math.abs((element.y2 || element.y) - element.y) + padding * 2
                    );
                } else {
                    ctx.strokeRect(element.x - padding, element.y - padding, (element.width || 0) + padding * 2, (element.height || 0) + padding * 2);
                }
                ctx.setLineDash([]);
            }
        });
    }, [elements, selectedElement]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const pos = getMousePos(e);

            if (tool === 'select') {
                // Check if clicking on an element
                const clickedElement = elements.find((el) => {
                    if (el.type === 'text') {
                        const canvas = canvasRef.current;
                        if (!canvas) return false;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return false;
                        ctx.font = `${el.fontSize || 16}px Arial`;
                        const metrics = ctx.measureText(el.text || '');
                        return pos.x >= el.x && pos.x <= el.x + metrics.width && pos.y >= el.y - (el.fontSize || 16) && pos.y <= el.y;
                    } else if (el.type === 'line') {
                        // Simple line hit detection
                        const distance =
                            Math.abs((el.y2! - el.y) * pos.x - (el.x2! - el.x) * pos.y + el.x2! * el.y - el.y2! * el.x) / Math.sqrt((el.y2! - el.y) ** 2 + (el.x2! - el.x) ** 2);
                        return distance < 5;
                    } else {
                        return pos.x >= el.x && pos.x <= el.x + (el.width || 0) && pos.y >= el.y && pos.y <= el.y + (el.height || 0);
                    }
                });

                if (clickedElement) {
                    setSelectedElement(clickedElement.id);
                    setIsDragging(true);
                    setDragOffset({
                        x: pos.x - clickedElement.x,
                        y: pos.y - clickedElement.y,
                    });
                } else {
                    setSelectedElement(null);
                }
            } else if (tool === 'text') {
                setTextInputPos(pos);
                setShowTextInput(true);
                setTextValue('');
            } else {
                // Start drawing
                setIsDrawing(true);
                const newElement: CanvasElement = {
                    id: Date.now().toString(),
                    type: tool,
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                    x2: pos.x,
                    y2: pos.y,
                    color: '#000000',
                    strokeWidth: 2,
                    fill: false,
                };
                setCurrentElement(newElement);
            }
        },
        [tool, elements, getMousePos]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const pos = getMousePos(e);

            if (isDragging && selectedElement) {
                setElements((prev) => prev.map((el) => (el.id === selectedElement ? { ...el, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y } : el)));
            } else if (isDrawing && currentElement) {
                const updatedElement = { ...currentElement };

                if (tool === 'line') {
                    updatedElement.x2 = pos.x;
                    updatedElement.y2 = pos.y;
                } else {
                    updatedElement.width = pos.x - currentElement.x;
                    updatedElement.height = pos.y - currentElement.y;
                }

                setCurrentElement(updatedElement);
                // Temporarily add to elements for preview
                setElements((prev) => {
                    const filtered = prev.filter((el) => el.id !== currentElement.id);
                    return [...filtered, updatedElement];
                });
            }
        },
        [isDragging, selectedElement, dragOffset, isDrawing, currentElement, tool, getMousePos]
    );

    const handleMouseUp = useCallback(() => {
        if (isDrawing && currentElement) {
            setElements((prev) => {
                const filtered = prev.filter((el) => el.id !== currentElement.id);
                return [...filtered, currentElement];
            });
            setIsDrawing(false);
            setCurrentElement(null);
        }
        setIsDragging(false);
    }, [isDrawing, currentElement]);

    const addText = useCallback(() => {
        if (textValue.trim()) {
            const newElement: CanvasElement = {
                id: Date.now().toString(),
                type: 'text',
                x: textInputPos.x,
                y: textInputPos.y,
                text: textValue,
                fontSize: 16,
                color: '#000000',
                strokeWidth: 1,
            };
            setElements((prev) => [...prev, newElement]);
        }
        setShowTextInput(false);
        setTextValue('');
    }, [textValue, textInputPos]);

    const deleteSelected = useCallback(() => {
        if (selectedElement) {
            setElements((prev) => prev.filter((el) => el.id !== selectedElement));
            setSelectedElement(null);
        }
    }, [selectedElement]);

    const saveCanvas = useCallback(async () => {
        try {
            console.log('Saving canvas with', elements.length, 'elements');
            const canvasData = JSON.stringify(elements);

            // Check if canvas note already exists
            const existingCanvas = initialCards.find((note) => note.title === 'Vision Canvas');
            console.log('Existing canvas:', existingCanvas);

            if (existingCanvas) {
                // Update existing using notes API
                console.log('Updating existing canvas:', existingCanvas.id);
                const response = await fetch(`/api/notes/${existingCanvas.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: canvasData,
                        updated_at: new Date().toISOString(),
                    }),
                });

                const responseText = await response.text();
                console.log('Update response status:', response.status);
                console.log('Update response:', responseText);

                if (!response.ok) {
                    throw new Error(`Failed to update canvas: ${response.status} - ${responseText}`);
                }
            } else {
                // Create new using notes API
                console.log('Creating new canvas');
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: 'Vision Canvas',
                        content: canvasData,
                        note_type: 'general',
                        tags: ['vision', 'canvas'],
                    }),
                });

                const responseText = await response.text();
                console.log('Create response status:', response.status);
                console.log('Create response:', responseText);

                if (!response.ok) {
                    throw new Error(`Failed to save canvas: ${response.status} - ${responseText}`);
                }
            }

            console.log('Canvas saved successfully');
            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving canvas:', error);
            alert(`Failed to save canvas: ${error.message}`);
        }
    }, [elements, initialCards]);

    // Auto-save every 30 seconds if there are changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (elements.length > 0) {
                saveCanvas();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [elements, saveCanvas]);

    return (
        <div className='flex h-full flex-col'>
            {/* Header */}
            <div className='border-b bg-background p-4'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold'>Vision Canvas</h1>
                        <p className='text-sm text-muted-foreground'>Draw your ideas and goals</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        {lastSaved && <span className='text-xs text-muted-foreground'>Last saved: {lastSaved.toLocaleTimeString()}</span>}
                        <button onClick={saveCanvas} className='flex items-center gap-2 rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                            <Save className='h-3 w-3' />
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className='border-b bg-secondary/10 p-2'>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => setTool('select')}
                        className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${tool === 'select' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                        <MousePointer className='h-4 w-4' />
                        Select
                    </button>
                    <button
                        onClick={() => setTool('text')}
                        className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${tool === 'text' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                        <Type className='h-4 w-4' />
                        Text
                    </button>
                    <button
                        onClick={() => setTool('rect')}
                        className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${tool === 'rect' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                        <Square className='h-4 w-4' />
                        Rectangle
                    </button>
                    <button
                        onClick={() => setTool('circle')}
                        className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${tool === 'circle' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                        <Circle className='h-4 w-4' />
                        Circle
                    </button>
                    <button
                        onClick={() => setTool('line')}
                        className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${tool === 'line' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                        <Minus className='h-4 w-4' />
                        Line
                    </button>

                    <div className='mx-2 h-6 w-px bg-border'></div>

                    {selectedElement && (
                        <button onClick={deleteSelected} className='flex items-center gap-1 rounded px-3 py-1 text-sm text-destructive hover:bg-destructive/10'>
                            <Trash2 className='h-4 w-4' />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className='flex-1 overflow-hidden bg-white p-4'>
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={800}
                    className='cursor-crosshair border shadow-sm'
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
                />

                {/* Text Input Modal */}
                {showTextInput && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                        <div className='rounded-lg bg-card p-4 shadow-lg'>
                            <h3 className='mb-3 font-medium'>Add Text</h3>
                            <input
                                type='text'
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addText()}
                                className='mb-3 w-full rounded border px-3 py-2'
                                placeholder='Enter text...'
                                autoFocus
                            />
                            <div className='flex gap-2'>
                                <button onClick={() => setShowTextInput(false)} className='rounded border px-3 py-1 text-sm hover:bg-secondary'>
                                    Cancel
                                </button>
                                <button onClick={addText} className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
