'use client';

import { X, Plus, Trash2 } from 'lucide-react';

interface DocumentFormProps {
    isOpen: boolean;
    editingDocument: any;
    documentForm: {
        title: string;
        category: string;
        document_type: string;
        is_encrypted: boolean;
        tags: string[];
        expiry_date: string;
        notes: string;
        fields: { label: string; field_value: string; is_secret: boolean; field_type: string; sort_order: number }[];
    };
    newTag: string;
    setNewTag: (tag: string) => void;
    setDocumentForm: (updater: (prev: any) => any) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function DocumentForm({ isOpen, editingDocument, documentForm, newTag, setNewTag, setDocumentForm, onSave, onCancel }: DocumentFormProps) {
    if (!isOpen) return null;

    const addField = () => {
        setDocumentForm((prev) => ({
            ...prev,
            fields: [
                ...prev.fields,
                {
                    label: '',
                    field_value: '',
                    is_secret: false,
                    field_type: 'text',
                    sort_order: prev.fields.length,
                },
            ],
        }));
    };

    const updateField = (index: number, field: Partial<(typeof documentForm.fields)[0]>) => {
        setDocumentForm((prev) => ({
            ...prev,
            fields: prev.fields.map((f, i) => (i === index ? { ...f, ...field } : f)),
        }));
    };

    const removeField = (index: number) => {
        setDocumentForm((prev) => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index),
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !documentForm.tags.includes(newTag.trim())) {
            setDocumentForm((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setDocumentForm((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6'>
                <div className='mb-6 flex items-center justify-between'>
                    <h3 className='text-lg font-semibold'>{editingDocument ? 'Edit Document' : 'Add New Document'}</h3>
                    <button onClick={onCancel} className='rounded p-1 hover:bg-accent'>
                        <X className='h-4 w-4' />
                    </button>
                </div>

                <div className='space-y-4'>
                    {/* Basic Info */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Title *</label>
                            <input
                                type='text'
                                value={documentForm.title}
                                onChange={(e) => setDocumentForm((prev) => ({ ...prev, title: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='Document title'
                            />
                        </div>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Category</label>
                            <select
                                value={documentForm.category}
                                onChange={(e) => setDocumentForm((prev) => ({ ...prev, category: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                <option value='personal'>Personal</option>
                                <option value='identity'>Identity</option>
                                <option value='travel'>Travel</option>
                                <option value='financial'>Financial</option>
                                <option value='medical'>Medical</option>
                                <option value='legal'>Legal</option>
                                <option value='business'>Business</option>
                            </select>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Document Type</label>
                            <input
                                type='text'
                                value={documentForm.document_type}
                                onChange={(e) => setDocumentForm((prev) => ({ ...prev, document_type: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='e.g., Passport, License, Certificate'
                            />
                        </div>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Expiry Date</label>
                            <input
                                type='date'
                                value={documentForm.expiry_date}
                                onChange={(e) => setDocumentForm((prev) => ({ ...prev, expiry_date: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='flex items-center gap-2'>
                            <input
                                type='checkbox'
                                checked={documentForm.is_encrypted}
                                onChange={(e) => setDocumentForm((prev) => ({ ...prev, is_encrypted: e.target.checked }))}
                                className='rounded'
                            />
                            <span className='text-sm font-medium'>Encrypted document</span>
                        </label>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className='mb-2 block text-sm font-medium'>Tags</label>
                        <div className='mb-2 flex gap-2'>
                            <input
                                type='text'
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className='flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='Add a tag'
                            />
                            <button type='button' onClick={addTag} className='rounded bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80'>
                                Add
                            </button>
                        </div>
                        <div className='flex flex-wrap gap-1'>
                            {documentForm.tags.map((tag, index) => (
                                <span key={index} className='inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                    {tag}
                                    <button type='button' onClick={() => removeTag(tag)} className='hover:text-primary/80'>
                                        <X className='h-3 w-3' />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Fields */}
                    <div>
                        <div className='mb-3 flex items-center justify-between'>
                            <label className='block text-sm font-medium'>Document Fields</label>
                            <button type='button' onClick={addField} className='flex items-center gap-2 text-sm text-primary hover:text-primary/80'>
                                <Plus className='h-4 w-4' />
                                Add Field
                            </button>
                        </div>
                        <div className='space-y-3'>
                            {documentForm.fields.map((field, index) => (
                                <div key={index} className='space-y-2 rounded border p-3'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm font-medium'>Field {index + 1}</span>
                                        <button type='button' onClick={() => removeField(index)} className='text-destructive hover:text-destructive/80'>
                                            <Trash2 className='h-4 w-4' />
                                        </button>
                                    </div>
                                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                                        <input
                                            type='text'
                                            value={field.label}
                                            onChange={(e) => updateField(index, { label: e.target.value })}
                                            className='rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                            placeholder='Field label'
                                        />
                                        <input
                                            type='text'
                                            value={field.field_value}
                                            onChange={(e) => updateField(index, { field_value: e.target.value })}
                                            className='rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                            placeholder='Field value'
                                        />
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        <label className='flex items-center gap-2'>
                                            <input
                                                type='checkbox'
                                                checked={field.is_secret}
                                                onChange={(e) => updateField(index, { is_secret: e.target.checked })}
                                                className='rounded'
                                            />
                                            <span className='text-sm'>Secret field</span>
                                        </label>
                                        <select
                                            value={field.field_type}
                                            onChange={(e) => updateField(index, { field_type: e.target.value })}
                                            className='rounded border px-2 py-1 text-sm'>
                                            <option value='text'>Text</option>
                                            <option value='email'>Email</option>
                                            <option value='url'>URL</option>
                                            <option value='number'>Number</option>
                                            <option value='date'>Date</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className='mb-2 block text-sm font-medium'>Notes</label>
                        <textarea
                            value={documentForm.notes}
                            onChange={(e) => setDocumentForm((prev) => ({ ...prev, notes: e.target.value }))}
                            className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                            rows={3}
                            placeholder='Additional notes...'
                        />
                    </div>
                </div>

                <div className='mt-6 flex gap-2'>
                    <button onClick={onCancel} className='flex-1 rounded-md border px-4 py-2 hover:bg-accent'>
                        Cancel
                    </button>
                    <button onClick={onSave} className='flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                        {editingDocument ? 'Update' : 'Save'} Document
                    </button>
                </div>
            </div>
        </div>
    );
}
