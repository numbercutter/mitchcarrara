'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Calendar, Phone, Mail, MapPin, Edit3, Trash2, Gift, Heart, Briefcase, Users } from 'lucide-react';
import type { Tables } from '@/types/database';
import ContactForm from './ContactForm';

type Contact = Tables<'contacts'>;

interface ContactsClientProps {
    initialContacts: Contact[];
}

const relationshipIcons = {
    family: Heart,
    friend: Users,
    colleague: Briefcase,
    business: Briefcase,
    other: Users,
};

const relationshipColors = {
    family: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    friend: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    colleague: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    business: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
};

export default function ContactsClient({ initialContacts }: ContactsClientProps) {
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRelationship, setFilterRelationship] = useState<string>('all');
    const [showContactForm, setShowContactForm] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        relationship: 'friend',
        company: '',
        position: '',
        address: '',
        birthday: '',
        tags: [] as string[],
        notes: '',
        social_media: {} as Record<string, string>,
    });
    const [newTag, setNewTag] = useState('');

    const resetForm = () => {
        setContactForm({
            name: '',
            email: '',
            phone: '',
            relationship: 'friend',
            company: '',
            position: '',
            address: '',
            birthday: '',
            tags: [],
            notes: '',
            social_media: {},
        });
        setEditingContact(null);
        setShowContactForm(false);
        setNewTag('');
    };

    const openEditForm = (contact: Contact) => {
        setEditingContact(contact);
        setContactForm({
            name: contact.name,
            email: contact.email || '',
            phone: contact.phone || '',
            relationship: contact.relationship,
            company: contact.company || '',
            position: contact.position || '',
            address: contact.address || '',
            birthday: contact.birthday ? contact.birthday.split('T')[0] : '',
            tags: contact.tags || [],
            notes: contact.notes || '',
            social_media: (contact.social_media as Record<string, string>) || {},
        });
        setShowContactForm(true);
    };

    const addTag = () => {
        if (newTag.trim() && !contactForm.tags.includes(newTag.trim())) {
            setContactForm((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setContactForm((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const saveContact = async () => {
        if (!contactForm.name.trim()) return;

        try {
            if (editingContact) {
                // Update existing contact
                const response = await fetch(`/api/contacts/${editingContact.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: contactForm.name,
                        email: contactForm.email || null,
                        phone: contactForm.phone || null,
                        relationship: contactForm.relationship,
                        company: contactForm.company || null,
                        position: contactForm.position || null,
                        address: contactForm.address || null,
                        birthday: contactForm.birthday || null,
                        tags: contactForm.tags,
                        notes: contactForm.notes || null,
                        social_media: contactForm.social_media,
                    }),
                });

                if (!response.ok) throw new Error('Failed to update contact');

                const updatedContact = await response.json();
                setContacts((prev) => prev.map((c) => (c.id === editingContact.id ? updatedContact : c)));
            } else {
                // Create new contact
                const response = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: contactForm.name,
                        email: contactForm.email || null,
                        phone: contactForm.phone || null,
                        relationship: contactForm.relationship,
                        company: contactForm.company || null,
                        position: contactForm.position || null,
                        address: contactForm.address || null,
                        birthday: contactForm.birthday || null,
                        tags: contactForm.tags,
                        notes: contactForm.notes || null,
                        social_media: contactForm.social_media,
                    }),
                });

                if (!response.ok) throw new Error('Failed to create contact');

                const newContact = await response.json();
                setContacts((prev) => [...prev, newContact]);
            }

            resetForm();
        } catch (error) {
            console.error('Error saving contact:', error);
        }
    };

    const deleteContact = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            const response = await fetch(`/api/contacts/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete contact');

            setContacts((prev) => prev.filter((c) => c.id !== id));
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const filteredContacts = contacts.filter((contact) => {
        const matchesSearch =
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRelationship = filterRelationship === 'all' || contact.relationship === filterRelationship;
        return matchesSearch && matchesRelationship;
    });

    return (
        <div className='flex h-full flex-col'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm pb-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Contacts</h1>
                        <p className='text-muted-foreground'>Manage your personal and professional contacts</p>
                    </div>
                    <button onClick={() => setShowContactForm(true)} className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                        <Plus className='h-4 w-4' />
                        Add Contact
                    </button>
                </div>

                {/* Search and Filters */}
                <div className='mt-6 flex gap-4'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <input
                            type='text'
                            placeholder='Search contacts...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary'
                        />
                    </div>
                    <select
                        value={filterRelationship}
                        onChange={(e) => setFilterRelationship(e.target.value)}
                        className='rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                        <option value='all'>All Relationships</option>
                        <option value='family'>Family</option>
                        <option value='friend'>Friend</option>
                        <option value='colleague'>Colleague</option>
                        <option value='business'>Business</option>
                        <option value='other'>Other</option>
                    </select>
                </div>
            </div>
            
            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto pt-6'>
            {/* Contacts Grid */}
            {filteredContacts.length > 0 ? (
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredContacts.map((contact) => {
                        const RelationshipIcon = relationshipIcons[contact.relationship as keyof typeof relationshipIcons] || Users;
                        const relationshipColor = relationshipColors[contact.relationship as keyof typeof relationshipColors];

                        return (
                            <div key={contact.id} className='rounded-lg border bg-card p-6 transition-shadow hover:shadow-md'>
                                {/* Contact Header */}
                                <div className='mb-4 flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className={`rounded-lg p-2 ${relationshipColor}`}>
                                            <RelationshipIcon className='h-5 w-5' />
                                        </div>
                                        <div>
                                            <h3 className='font-semibold'>{contact.name}</h3>
                                            <p className='text-sm capitalize text-muted-foreground'>{contact.relationship}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <button onClick={() => openEditForm(contact)} className='rounded p-1 hover:bg-accent'>
                                            <Edit3 className='h-4 w-4' />
                                        </button>
                                        <button onClick={() => deleteContact(contact.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                            <Trash2 className='h-4 w-4' />
                                        </button>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className='space-y-3'>
                                    {contact.email && (
                                        <div className='flex items-center gap-2 text-sm'>
                                            <Mail className='h-4 w-4 text-muted-foreground' />
                                            <a href={`mailto:${contact.email}`} className='text-primary hover:underline'>
                                                {contact.email}
                                            </a>
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className='flex items-center gap-2 text-sm'>
                                            <Phone className='h-4 w-4 text-muted-foreground' />
                                            <a href={`tel:${contact.phone}`} className='text-primary hover:underline'>
                                                {contact.phone}
                                            </a>
                                        </div>
                                    )}
                                    {contact.company && (
                                        <div className='flex items-center gap-2 text-sm'>
                                            <Briefcase className='h-4 w-4 text-muted-foreground' />
                                            <span>
                                                {contact.company}
                                                {contact.position && ` - ${contact.position}`}
                                            </span>
                                        </div>
                                    )}
                                    {contact.address && (
                                        <div className='flex items-center gap-2 text-sm'>
                                            <MapPin className='h-4 w-4 text-muted-foreground' />
                                            <span>{contact.address}</span>
                                        </div>
                                    )}
                                    {contact.birthday && (
                                        <div className='flex items-center gap-2 text-sm'>
                                            <Calendar className='h-4 w-4 text-muted-foreground' />
                                            <span>Birthday: {new Date(contact.birthday).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                {contact.tags && contact.tags.length > 0 && (
                                    <div className='mt-4'>
                                        <div className='flex flex-wrap gap-1'>
                                            {contact.tags.map((tag, index) => (
                                                <span key={index} className='rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {contact.notes && <div className='mt-4 rounded bg-muted/50 p-3 text-sm'>{contact.notes}</div>}

                                {/* Last Contact */}
                                {contact.last_contact && (
                                    <div className='mt-4 text-sm text-muted-foreground'>Last contact: {new Date(contact.last_contact).toLocaleDateString()}</div>
                                )}

                                {/* Social Media */}
                                {contact.social_media && Object.keys(contact.social_media as any).length > 0 && (
                                    <div className='mt-4'>
                                        <p className='mb-2 text-sm font-medium'>Social Media:</p>
                                        <div className='flex flex-wrap gap-2'>
                                            {Object.entries(contact.social_media as any).map(([platform, handle]) => (
                                                <span key={platform} className='rounded bg-accent px-2 py-1 text-xs'>
                                                    {platform}: {handle as string}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='py-12 text-center'>
                    <Users className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                    <h3 className='mb-2 text-lg font-semibold'>No Contacts Found</h3>
                    <p className='mb-4 text-muted-foreground'>
                        {searchQuery || filterRelationship !== 'all' ? 'No contacts match your search criteria.' : 'Get started by adding your first contact.'}
                    </p>
                    <button onClick={() => setShowContactForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                        Add Your First Contact
                    </button>
                </div>
            )}

            <ContactForm
                isOpen={showContactForm}
                editingContact={editingContact}
                contactForm={contactForm}
                newTag={newTag}
                setNewTag={setNewTag}
                setContactForm={setContactForm}
                onSave={saveContact}
                onCancel={resetForm}
                onAddTag={addTag}
                onRemoveTag={removeTag}
            />
            </div>
        </div>
    );
}
