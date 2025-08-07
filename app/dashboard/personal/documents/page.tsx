'use client';

import { useState } from 'react';
import { Shield, Plus, Search, Filter, FileText, Lock, Eye, EyeOff, Copy, Edit3, Trash2, CreditCard, Plane, Key, User, Building } from 'lucide-react';

interface SecureDocument {
    id: string;
    title: string;
    category: 'identity' | 'travel' | 'financial' | 'medical' | 'legal' | 'personal' | 'business';
    type: 'passport' | 'license' | 'card' | 'account' | 'insurance' | 'document' | 'other';
    isEncrypted: boolean;
    fields: DocumentField[];
    tags: string[];
    lastAccessed?: string;
    expiryDate?: string;
    notes?: string;
}

interface DocumentField {
    id: string;
    label: string;
    value: string;
    isSecret: boolean;
    fieldType: 'text' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'password';
}

const categoryIcons = {
    identity: User,
    travel: Plane,
    financial: CreditCard,
    medical: FileText,
    legal: Shield,
    personal: Key,
    business: Building
};

const categoryColors = {
    identity: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    travel: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    financial: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    medical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    legal: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    personal: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    business: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
};

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<SecureDocument[]>([
        {
            id: '1',
            title: 'US Passport',
            category: 'travel',
            type: 'passport',
            isEncrypted: true,
            fields: [
                { id: '1', label: 'Passport Number', value: 'ABC123456', isSecret: true, fieldType: 'text' },
                { id: '2', label: 'Full Name', value: 'Mitchell Carrara', isSecret: false, fieldType: 'text' },
                { id: '3', label: 'Date of Birth', value: '1985-03-15', isSecret: false, fieldType: 'date' },
                { id: '4', label: 'Issue Date', value: '2020-01-15', isSecret: false, fieldType: 'date' },
                { id: '5', label: 'Expiry Date', value: '2030-01-15', isSecret: false, fieldType: 'date' },
                { id: '6', label: 'Place of Birth', value: 'San Francisco, CA', isSecret: false, fieldType: 'text' }
            ],
            tags: ['travel', 'identification'],
            expiryDate: '2030-01-15',
            notes: 'Keep digital copy in cloud storage as backup'
        },
        {
            id: '2',
            title: 'Primary Bank Account',
            category: 'financial',
            type: 'account',
            isEncrypted: true,
            fields: [
                { id: '7', label: 'Bank Name', value: 'Chase Bank', isSecret: false, fieldType: 'text' },
                { id: '8', label: 'Account Number', value: '****1234', isSecret: true, fieldType: 'text' },
                { id: '9', label: 'Routing Number', value: '021000021', isSecret: true, fieldType: 'text' },
                { id: '10', label: 'Account Type', value: 'Business Checking', isSecret: false, fieldType: 'text' },
                { id: '11', label: 'Online Banking', value: 'https://chase.com', isSecret: false, fieldType: 'url' },
                { id: '12', label: 'Customer Service', value: '1-800-935-9935', isSecret: false, fieldType: 'phone' }
            ],
            tags: ['banking', 'primary'],
            notes: 'Main business account for all companies'
        },
        {
            id: '3',
            title: 'Health Insurance Card',
            category: 'medical',
            type: 'insurance',
            isEncrypted: true,
            fields: [
                { id: '13', label: 'Insurance Company', value: 'Blue Cross Blue Shield', isSecret: false, fieldType: 'text' },
                { id: '14', label: 'Member ID', value: 'BC123456789', isSecret: true, fieldType: 'text' },
                { id: '15', label: 'Group Number', value: 'GRP987654', isSecret: true, fieldType: 'text' },
                { id: '16', label: 'Plan Name', value: 'PPO Gold Plus', isSecret: false, fieldType: 'text' },
                { id: '17', label: 'Effective Date', value: '2024-01-01', isSecret: false, fieldType: 'date' },
                { id: '18', label: 'Customer Service', value: '1-800-123-4567', isSecret: false, fieldType: 'phone' }
            ],
            tags: ['healthcare', 'insurance'],
            notes: 'Annual renewal in December'
        },
        {
            id: '4',
            title: 'Emergency Contacts',
            category: 'personal',
            type: 'document',
            isEncrypted: false,
            fields: [
                { id: '19', label: 'Primary Contact', value: 'Emma Rodriguez (Sister)', isSecret: false, fieldType: 'text' },
                { id: '20', label: 'Phone', value: '+1 555-0789', isSecret: false, fieldType: 'phone' },
                { id: '21', label: 'Secondary Contact', value: 'Sarah Johnson', isSecret: false, fieldType: 'text' },
                { id: '22', label: 'Phone', value: '+1 555-0123', isSecret: false, fieldType: 'phone' },
                { id: '23', label: 'Medical Contact', value: 'Dr. Smith', isSecret: false, fieldType: 'text' },
                { id: '24', label: 'Medical Phone', value: '+1 555-DOCTOR', isSecret: false, fieldType: 'phone' }
            ],
            tags: ['emergency', 'contacts'],
            notes: 'Keep updated for travel and medical emergencies'
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showDocumentForm, setShowDocumentForm] = useState(false);
    const [viewingDocument, setViewingDocument] = useState<SecureDocument | null>(null);
    const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());

    const [newDocument, setNewDocument] = useState({
        title: '',
        category: 'personal' as SecureDocument['category'],
        type: 'document' as SecureDocument['type'],
        isEncrypted: true,
        notes: '',
        fields: [] as Omit<DocumentField, 'id'>[]
    });

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterCategory === 'all' || doc.category === filterCategory;
        return matchesSearch && matchesFilter;
    });

    const toggleFieldVisibility = (fieldId: string) => {
        const newHidden = new Set(hiddenFields);
        if (newHidden.has(fieldId)) {
            newHidden.delete(fieldId);
        } else {
            newHidden.add(fieldId);
        }
        setHiddenFields(newHidden);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast notification here
    };

    const addDocument = () => {
        if (!newDocument.title.trim()) return;

        const document: SecureDocument = {
            id: Date.now().toString(),
            ...newDocument,
            fields: newDocument.fields.map((field, index) => ({
                ...field,
                id: (Date.now() + index).toString()
            })),
            tags: []
        };

        setDocuments([...documents, document]);
        setNewDocument({
            title: '', category: 'personal', type: 'document', isEncrypted: true,
            notes: '', fields: []
        });
        setShowDocumentForm(false);
    };

    const addField = () => {
        setNewDocument({
            ...newDocument,
            fields: [
                ...newDocument.fields,
                { label: '', value: '', isSecret: false, fieldType: 'text' }
            ]
        });
    };

    const updateField = (index: number, field: Partial<Omit<DocumentField, 'id'>>) => {
        const updatedFields = [...newDocument.fields];
        updatedFields[index] = { ...updatedFields[index], ...field };
        setNewDocument({ ...newDocument, fields: updatedFields });
    };

    const removeField = (index: number) => {
        setNewDocument({
            ...newDocument,
            fields: newDocument.fields.filter((_, i) => i !== index)
        });
    };

    const expiringDocuments = documents.filter(doc => {
        if (!doc.expiryDate) return false;
        const expiry = new Date(doc.expiryDate);
        const today = new Date();
        const monthsUntilExpiry = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsUntilExpiry <= 6 && monthsUntilExpiry > 0;
    });

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold flex items-center gap-2'>
                        <Shield className='h-8 w-8' />
                        Secure Documents
                    </h1>
                    <p className='mt-2 text-muted-foreground'>Store sensitive information securely for easy assistant access.</p>
                </div>
                <button
                    onClick={() => setShowDocumentForm(true)}
                    className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90'>
                    <Plus className='h-4 w-4' />
                    Add Document
                </button>
            </div>

            {/* Security Notice */}
            <div className='rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/10'>
                <div className='flex items-center'>
                    <Shield className='h-5 w-5 text-yellow-600 mr-2' />
                    <h3 className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>Security Notice</h3>
                </div>
                <p className='mt-2 text-sm text-yellow-700 dark:text-yellow-300'>
                    This vault stores sensitive information for your assistant to access when needed for travel booking, appointments, etc. 
                    All encrypted documents are protected with additional security layers.
                </p>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <FileText className='h-4 w-4 text-blue-600' />
                        <span className='text-sm text-muted-foreground'>Total Documents</span>
                    </div>
                    <p className='text-2xl font-bold'>{documents.length}</p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Lock className='h-4 w-4 text-green-600' />
                        <span className='text-sm text-muted-foreground'>Encrypted</span>
                    </div>
                    <p className='text-2xl font-bold'>{documents.filter(d => d.isEncrypted).length}</p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Plane className='h-4 w-4 text-purple-600' />
                        <span className='text-sm text-muted-foreground'>Travel Docs</span>
                    </div>
                    <p className='text-2xl font-bold'>{documents.filter(d => d.category === 'travel').length}</p>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <CreditCard className='h-4 w-4 text-orange-600' />
                        <span className='text-sm text-muted-foreground'>Financial</span>
                    </div>
                    <p className='text-2xl font-bold'>{documents.filter(d => d.category === 'financial').length}</p>
                </div>
            </div>

            {/* Expiring Documents Alert */}
            {expiringDocuments.length > 0 && (
                <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-4 font-semibold text-orange-600 flex items-center gap-2'>
                        <Shield className='h-5 w-5' />
                        Documents Expiring Soon
                    </h3>
                    <div className='space-y-2'>
                        {expiringDocuments.map(doc => (
                            <div key={doc.id} className='flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10'>
                                <div>
                                    <p className='font-medium text-sm'>{doc.title}</p>
                                    <p className='text-xs text-muted-foreground'>Expires: {doc.expiryDate}</p>
                                </div>
                                <button
                                    onClick={() => setViewingDocument(doc)}
                                    className='text-sm text-orange-600 hover:text-orange-800'>
                                    View Details
                                </button>
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
                        {['all', 'identity', 'travel', 'financial', 'medical', 'legal', 'personal', 'business'].map(category => (
                            <button
                                key={category}
                                onClick={() => setFilterCategory(category)}
                                className={`rounded-md px-3 py-1 text-sm transition-colors capitalize ${
                                    filterCategory === category
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}>
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <input
                        type='text'
                        placeholder='Search documents...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full rounded-md border bg-background pl-9 pr-4 py-2 text-sm'
                    />
                </div>
            </div>

            {/* Documents Grid */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredDocuments.map(doc => {
                    const CategoryIcon = categoryIcons[doc.category];
                    return (
                        <div key={doc.id} className='rounded-lg border bg-card p-4 hover:shadow-md transition-shadow'>
                            <div className='flex items-start justify-between mb-3'>
                                <div className='flex items-center gap-2'>
                                    <CategoryIcon className='h-5 w-5' />
                                    <h3 className='font-semibold'>{doc.title}</h3>
                                </div>
                                {doc.isEncrypted && <Lock className='h-4 w-4 text-green-600' />}
                            </div>
                            
                            <div className='flex items-center gap-2 mb-3'>
                                <span className={`px-2 py-1 rounded-full text-xs ${categoryColors[doc.category]}`}>
                                    {doc.category}
                                </span>
                                <span className='px-2 py-1 rounded-full text-xs bg-secondary text-muted-foreground'>
                                    {doc.type}
                                </span>
                            </div>

                            <div className='space-y-2 mb-4'>
                                {doc.fields.slice(0, 3).map(field => (
                                    <div key={field.id} className='flex justify-between text-sm'>
                                        <span className='text-muted-foreground'>{field.label}:</span>
                                        <span className={field.isSecret ? 'font-mono' : ''}>
                                            {field.isSecret && hiddenFields.has(field.id) ? '•••••' : field.value}
                                        </span>
                                    </div>
                                ))}
                                {doc.fields.length > 3 && (
                                    <p className='text-xs text-muted-foreground'>
                                        +{doc.fields.length - 3} more fields
                                    </p>
                                )}
                            </div>

                            <div className='flex justify-between items-center'>
                                <button
                                    onClick={() => setViewingDocument(doc)}
                                    className='text-sm text-primary hover:text-primary/80'>
                                    View Details
                                </button>
                                <div className='flex gap-1'>
                                    <button className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                        <Edit3 className='h-3 w-3' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
                        <div className='p-6 border-b'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-xl font-semibold flex items-center gap-2'>
                                    {viewingDocument.isEncrypted && <Lock className='h-5 w-5 text-green-600' />}
                                    {viewingDocument.title}
                                </h2>
                                <button
                                    onClick={() => setViewingDocument(null)}
                                    className='text-muted-foreground hover:text-foreground'>
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className='p-6'>
                            <div className='space-y-4'>
                                {viewingDocument.fields.map(field => (
                                    <div key={field.id} className='flex items-center justify-between p-3 bg-secondary/20 rounded-lg'>
                                        <div>
                                            <p className='font-medium text-sm'>{field.label}</p>
                                            <p className={`text-sm ${field.isSecret ? 'font-mono' : ''}`}>
                                                {field.isSecret && hiddenFields.has(field.id) ? '•••••••••' : field.value}
                                            </p>
                                        </div>
                                        <div className='flex gap-1'>
                                            {field.isSecret && (
                                                <button
                                                    onClick={() => toggleFieldVisibility(field.id)}
                                                    className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                                    {hiddenFields.has(field.id) ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => copyToClipboard(field.value)}
                                                className='rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
                                                <Copy className='h-4 w-4' />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {viewingDocument.notes && (
                                <div className='mt-4 p-3 bg-secondary/20 rounded-lg'>
                                    <p className='font-medium text-sm mb-1'>Notes</p>
                                    <p className='text-sm text-muted-foreground'>{viewingDocument.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {filteredDocuments.length === 0 && (
                <div className='text-center py-12'>
                    <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50'>
                        <Shield className='h-8 w-8 text-muted-foreground' />
                    </div>
                    <h3 className='text-lg font-semibold'>No documents found</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                        {searchQuery ? 'Try adjusting your search' : 'Add your first secure document to get started'}
                    </p>
                </div>
            )}
        </div>
    );
}