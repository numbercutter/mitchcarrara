'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Calendar, Phone, Mail, MapPin, Edit3, Trash2, Gift, Heart, Briefcase, Users } from 'lucide-react';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthday?: string;
    address?: string;
    relationship: 'family' | 'friend' | 'colleague' | 'business' | 'other';
    company?: string;
    position?: string;
    notes: string;
    tags: string[];
    lastContact?: string;
    socialMedia?: {
        linkedin?: string;
        twitter?: string;
        instagram?: string;
    };
    preferences?: {
        communication: 'email' | 'phone' | 'text' | 'any';
        giftIdeas: string[];
        interests: string[];
    };
    importantDates?: {
        anniversary?: string;
        workAnniversary?: string;
        other?: { date: string; event: string }[];
    };
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([
        {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1 555-0123',
            birthday: '1992-03-15',
            address: '123 Main St, San Francisco, CA',
            relationship: 'friend',
            company: 'Tech Corp',
            position: 'Product Manager',
            notes: 'Met at Stanford. Great for business advice. Loves hiking and craft beer.',
            tags: ['stanford', 'product', 'hiking'],
            lastContact: '2024-01-10',
            socialMedia: {
                linkedin: 'sarah-johnson-pm',
                instagram: 'sarahj_adventures'
            },
            preferences: {
                communication: 'email',
                giftIdeas: ['craft beer', 'hiking gear', 'business books'],
                interests: ['product management', 'hiking', 'photography']
            }
        },
        {
            id: '2',
            name: 'Michael Chen',
            email: 'mchen@venture.com',
            phone: '+1 555-0456',
            birthday: '1988-07-22',
            relationship: 'business',
            company: 'Venture Capital Partners',
            position: 'Partner',
            notes: 'Lead investor in Series A. Very responsive, prefers morning meetings. Has connections in fintech.',
            tags: ['investor', 'fintech', 'series-a'],
            lastContact: '2024-01-12',
            socialMedia: {
                linkedin: 'michael-chen-vc',
                twitter: 'mchen_vc'
            },
            preferences: {
                communication: 'phone',
                giftIdeas: ['premium coffee', 'business books', 'tech gadgets'],
                interests: ['fintech', 'ai', 'golf']
            },
            importantDates: {
                workAnniversary: '2018-04-01'
            }
        },
        {
            id: '3',
            name: 'Emma Rodriguez',
            email: 'emma.r@email.com',
            phone: '+1 555-0789',
            birthday: '1995-11-08',
            relationship: 'family',
            address: '456 Oak Ave, Los Angeles, CA',
            notes: 'Younger sister. Currently in grad school for psychology. Vegetarian, loves yoga and meditation.',
            tags: ['sister', 'psychology', 'yoga'],
            lastContact: '2024-01-14',
            socialMedia: {
                instagram: 'emma_wellness'
            },
            preferences: {
                communication: 'text',
                giftIdeas: ['yoga gear', 'meditation apps', 'plant-based cookbooks'],
                interests: ['psychology', 'wellness', 'sustainable living']
            }
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterRelationship, setFilterRelationship] = useState<string>('all');
    const [showContactForm, setShowContactForm] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const [newContact, setNewContact] = useState({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        address: '',
        relationship: 'friend' as Contact['relationship'],
        company: '',
        position: '',
        notes: '',
        tags: [] as string[],
        preferences: {
            communication: 'email' as const,
            giftIdeas: [] as string[],
            interests: [] as string[]
        }
    });

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterRelationship === 'all' || contact.relationship === filterRelationship;
        return matchesSearch && matchesFilter;
    });

    const upcomingBirthdays = contacts
        .filter(contact => contact.birthday)
        .map(contact => {
            const today = new Date();
            const birthday = new Date(contact.birthday + '-' + today.getFullYear());
            if (birthday < today) {
                birthday.setFullYear(today.getFullYear() + 1);
            }
            const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return { ...contact, daysUntil };
        })
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 5);

    const addContact = () => {
        if (!newContact.name.trim()) return;

        const contact: Contact = {
            id: Date.now().toString(),
            ...newContact,
            tags: newContact.tags.filter(tag => tag.trim() !== '')
        };

        setContacts([...contacts, contact]);
        setNewContact({
            name: '', email: '', phone: '', birthday: '', address: '', relationship: 'friend',
            company: '', position: '', notes: '', tags: [],
            preferences: { communication: 'email', giftIdeas: [], interests: [] }
        });
        setShowContactForm(false);
    };

    const relationshipIcons = {
        family: Heart,
        friend: Users,
        colleague: Briefcase,
        business: Briefcase,
        other: Users
    };

    const relationshipColors = {
        family: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
        friend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
        colleague: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
        business: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
        other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Contacts</h1>
                    <p className='mt-2 text-muted-foreground'>Manage your personal and professional relationships.</p>
                </div>
                <button
                    onClick={() => setShowContactForm(true)}
                    className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                    <Plus className='h-4 w-4' />
                    Add Contact
                </button>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Users className='h-4 w-4 text-blue-600' />
                        <span className='text-sm text-muted-foreground'>Total Contacts</span>
                    </div>
                    <p className='text-2xl font-bold'>{contacts.length}</p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Gift className='h-4 w-4 text-green-600' />
                        <span className='text-sm text-muted-foreground'>Birthdays This Month</span>
                    </div>
                    <p className='text-2xl font-bold'>
                        {contacts.filter(c => c.birthday && new Date(c.birthday).getMonth() === new Date().getMonth()).length}
                    </p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Briefcase className='h-4 w-4 text-purple-600' />
                        <span className='text-sm text-muted-foreground'>Business Contacts</span>
                    </div>
                    <p className='text-2xl font-bold'>
                        {contacts.filter(c => c.relationship === 'business' || c.relationship === 'colleague').length}
                    </p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Heart className='h-4 w-4 text-red-600' />
                        <span className='text-sm text-muted-foreground'>Family & Friends</span>
                    </div>
                    <p className='text-2xl font-bold'>
                        {contacts.filter(c => c.relationship === 'family' || c.relationship === 'friend').length}
                    </p>
                </div>
            </div>

            {/* Upcoming Birthdays */}
            {upcomingBirthdays.length > 0 && (
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold flex items-center gap-2'>
                        <Gift className='h-5 w-5 text-green-600' />
                        Upcoming Birthdays
                    </h3>
                    <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                        {upcomingBirthdays.map(contact => (
                            <div key={contact.id} className='flex items-center gap-3 p-3 rounded-lg bg-secondary/30'>
                                <div className='flex-1'>
                                    <p className='font-medium text-sm'>{contact.name}</p>
                                    <p className='text-xs text-muted-foreground'>{contact.birthday}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-xs font-medium text-green-600'>
                                        {contact.daysUntil === 0 ? 'Today!' : 
                                         contact.daysUntil === 1 ? 'Tomorrow' : 
                                         `${contact.daysUntil} days`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-2'>
                    <Filter className='h-4 w-4 text-muted-foreground' />
                    <div className='flex gap-1'>
                        {['all', 'family', 'friend', 'colleague', 'business', 'other'].map(relationship => (
                            <button
                                key={relationship}
                                onClick={() => setFilterRelationship(relationship)}
                                className={`rounded-md px-3 py-1 text-sm transition-colors capitalize ${
                                    filterRelationship === relationship
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}>
                                {relationship}
                            </button>
                        ))}
                    </div>
                </div>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <input
                        type='text'
                        placeholder='Search contacts...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full rounded-md border bg-background pl-9 pr-4 py-2 text-sm'
                    />
                </div>
            </div>

            {/* New Contact Form */}
            {showContactForm && (
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold'>Add New Contact</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Name *</label>
                            <input
                                type='text'
                                value={newContact.name}
                                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='Full name...'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Email</label>
                            <input
                                type='email'
                                value={newContact.email}
                                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='email@example.com'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Phone</label>
                            <input
                                type='tel'
                                value={newContact.phone}
                                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='+1 555-0123'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Birthday</label>
                            <input
                                type='date'
                                value={newContact.birthday}
                                onChange={(e) => setNewContact({...newContact, birthday: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Relationship</label>
                            <select
                                value={newContact.relationship}
                                onChange={(e) => setNewContact({...newContact, relationship: e.target.value as Contact['relationship']})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'>
                                <option value='friend'>Friend</option>
                                <option value='family'>Family</option>
                                <option value='colleague'>Colleague</option>
                                <option value='business'>Business</option>
                                <option value='other'>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Company</label>
                            <input
                                type='text'
                                value={newContact.company}
                                onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                                className='w-full rounded border bg-background px-3 py-2 text-sm'
                                placeholder='Company name...'
                            />
                        </div>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium mb-1'>Notes</label>
                            <textarea
                                value={newContact.notes}
                                onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                                className='w-full resize-none rounded border bg-background px-3 py-2 text-sm'
                                rows={3}
                                placeholder='Personal notes, preferences, how you met...'
                            />
                        </div>
                    </div>
                    <div className='flex justify-end gap-2 mt-4'>
                        <button
                            onClick={() => setShowContactForm(false)}
                            className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'>
                            Cancel
                        </button>
                        <button
                            onClick={addContact}
                            className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90'>
                            Add Contact
                        </button>
                    </div>
                </div>
            )}

            {/* Contacts List */}
            <div className='grid gap-4'>
                {filteredContacts.map(contact => {
                    const RelationshipIcon = relationshipIcons[contact.relationship];
                    return (
                        <div key={contact.id} className='rounded-lg border bg-card p-4'>
                            <div className='flex items-start justify-between'>
                                <div className='flex items-start gap-4 flex-1'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <h3 className='font-semibold'>{contact.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${relationshipColors[contact.relationship]}`}>
                                                <RelationshipIcon className='h-3 w-3' />
                                                {contact.relationship}
                                            </span>
                                            {contact.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className='px-2 py-1 rounded-full text-xs bg-secondary text-muted-foreground'>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground mb-3'>
                                            {contact.email && (
                                                <div className='flex items-center gap-2'>
                                                    <Mail className='h-3 w-3' />
                                                    {contact.email}
                                                </div>
                                            )}
                                            {contact.phone && (
                                                <div className='flex items-center gap-2'>
                                                    <Phone className='h-3 w-3' />
                                                    {contact.phone}
                                                </div>
                                            )}
                                            {contact.birthday && (
                                                <div className='flex items-center gap-2'>
                                                    <Gift className='h-3 w-3' />
                                                    {new Date(contact.birthday).toLocaleDateString()}
                                                </div>
                                            )}
                                            {contact.company && (
                                                <div className='flex items-center gap-2'>
                                                    <Briefcase className='h-3 w-3' />
                                                    {contact.company}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {contact.notes && (
                                            <p className='text-sm text-muted-foreground mb-2'>{contact.notes}</p>
                                        )}
                                        
                                        {contact.preferences?.giftIdeas && contact.preferences.giftIdeas.length > 0 && (
                                            <div className='text-sm'>
                                                <span className='font-medium text-muted-foreground'>Gift Ideas: </span>
                                                <span className='text-muted-foreground'>{contact.preferences.giftIdeas.join(', ')}</span>
                                            </div>
                                        )}
                                        
                                        {contact.lastContact && (
                                            <p className='text-xs text-muted-foreground mt-2'>
                                                Last contact: {new Date(contact.lastContact).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <button className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                        <Edit3 className='h-4 w-4' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredContacts.length === 0 && (
                <div className='text-center py-12'>
                    <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50'>
                        <Users className='h-8 w-8 text-muted-foreground' />
                    </div>
                    <h3 className='text-lg font-semibold'>No contacts found</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                        {searchQuery ? 'Try adjusting your search' : 'Add your first contact to get started'}
                    </p>
                </div>
            )}
        </div>
    );
}