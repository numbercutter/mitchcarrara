'use client';

import { X } from 'lucide-react';

interface ContactFormProps {
    isOpen: boolean;
    editingContact: any;
    contactForm: {
        name: string;
        email: string;
        phone: string;
        relationship: string;
        company: string;
        position: string;
        address: string;
        birthday: string;
        tags: string[];
        notes: string;
        social_media: Record<string, string>;
    };
    newTag: string;
    setNewTag: (tag: string) => void;
    setContactForm: (updater: (prev: any) => any) => void;
    onSave: () => void;
    onCancel: () => void;
    onAddTag: () => void;
    onRemoveTag: (tag: string) => void;
}

export default function ContactForm({ isOpen, editingContact, contactForm, newTag, setNewTag, setContactForm, onSave, onCancel, onAddTag, onRemoveTag }: ContactFormProps) {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6'>
                <div className='mb-6 flex items-center justify-between'>
                    <h3 className='text-lg font-semibold'>{editingContact ? 'Edit Contact' : 'Add New Contact'}</h3>
                    <button onClick={onCancel} className='rounded p-1 hover:bg-accent'>
                        <X className='h-4 w-4' />
                    </button>
                </div>

                <div className='space-y-4'>
                    {/* Basic Info */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Name *</label>
                            <input
                                type='text'
                                value={contactForm.name}
                                onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='Full name'
                            />
                        </div>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Relationship</label>
                            <select
                                value={contactForm.relationship}
                                onChange={(e) => setContactForm((prev) => ({ ...prev, relationship: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                                <option value='friend'>Friend</option>
                                <option value='family'>Family</option>
                                <option value='colleague'>Colleague</option>
                                <option value='business'>Business</option>
                                <option value='other'>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Email</label>
                            <input
                                type='email'
                                value={contactForm.email}
                                onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='email@example.com'
                            />
                        </div>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Phone</label>
                            <input
                                type='tel'
                                value={contactForm.phone}
                                onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='Phone number'
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Company</label>
                            <input
                                type='text'
                                value={contactForm.company}
                                onChange={(e) => setContactForm((prev) => ({ ...prev, company: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='Company name'
                            />
                        </div>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>Position</label>
                            <input
                                type='text'
                                value={contactForm.position}
                                onChange={(e) => setContactForm((prev) => ({ ...prev, position: e.target.value }))}
                                className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='Job title'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='mb-2 block text-sm font-medium'>Address</label>
                        <input
                            type='text'
                            value={contactForm.address}
                            onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))}
                            className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                            placeholder='Full address'
                        />
                    </div>

                    <div>
                        <label className='mb-2 block text-sm font-medium'>Birthday</label>
                        <input
                            type='date'
                            value={contactForm.birthday}
                            onChange={(e) => setContactForm((prev) => ({ ...prev, birthday: e.target.value }))}
                            className='w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className='mb-2 block text-sm font-medium'>Tags</label>
                        <div className='mb-2 flex gap-2'>
                            <input
                                type='text'
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
                                className='flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                placeholder='Add a tag'
                            />
                            <button type='button' onClick={onAddTag} className='rounded bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80'>
                                Add
                            </button>
                        </div>
                        <div className='flex flex-wrap gap-1'>
                            {contactForm.tags.map((tag, index) => (
                                <span key={index} className='inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                    {tag}
                                    <button type='button' onClick={() => onRemoveTag(tag)} className='hover:text-primary/80'>
                                        <X className='h-3 w-3' />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className='mb-2 block text-sm font-medium'>Notes</label>
                        <textarea
                            value={contactForm.notes}
                            onChange={(e) => setContactForm((prev) => ({ ...prev, notes: e.target.value }))}
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
                        {editingContact ? 'Update' : 'Save'} Contact
                    </button>
                </div>
            </div>
        </div>
    );
}
