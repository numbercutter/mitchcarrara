'use client';

import { useState } from 'react';
import { Shield, Plus, Search, Filter, FileText, Lock, Eye, EyeOff, Copy, Edit3, Trash2, CreditCard, Plane, Key, User, Building } from 'lucide-react';
import type { Tables } from '@/types/database';
import DocumentForm from './DocumentForm';

type SecureDocument = Tables<'secure_documents'> & {
    fields: Tables<'document_fields'>[];
};

interface DocumentsClientProps {
    initialDocuments: SecureDocument[];
}

const categoryIcons = {
    identity: User,
    travel: Plane,
    financial: CreditCard,
    medical: FileText,
    legal: Shield,
    personal: Key,
    business: Building,
};

const categoryColors = {
    identity: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    travel: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    financial: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    medical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    legal: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    personal: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    business: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
};

export default function DocumentsClient({ initialDocuments }: DocumentsClientProps) {
    const [documents, setDocuments] = useState<SecureDocument[]>(initialDocuments);
    const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showDocumentForm, setShowDocumentForm] = useState(false);
    const [editingDocument, setEditingDocument] = useState<SecureDocument | null>(null);
    const [documentForm, setDocumentForm] = useState({
        title: '',
        category: 'personal',
        document_type: '',
        is_encrypted: false,
        tags: [] as string[],
        expiry_date: '',
        notes: '',
        fields: [] as { label: string; field_value: string; is_secret: boolean; field_type: string; sort_order: number }[],
    });
    const [newTag, setNewTag] = useState('');

    const toggleSecretVisibility = (fieldId: string) => {
        const newVisible = new Set(visibleSecrets);
        if (newVisible.has(fieldId)) {
            newVisible.delete(fieldId);
        } else {
            newVisible.add(fieldId);
        }
        setVisibleSecrets(newVisible);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const resetForm = () => {
        setDocumentForm({
            title: '',
            category: 'personal',
            document_type: '',
            is_encrypted: false,
            tags: [],
            expiry_date: '',
            notes: '',
            fields: [],
        });
        setEditingDocument(null);
        setShowDocumentForm(false);
    };

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

    const openEditForm = (document: SecureDocument) => {
        setEditingDocument(document);
        setDocumentForm({
            title: document.title,
            category: document.category,
            document_type: document.document_type || '',
            is_encrypted: document.is_encrypted || false,
            tags: document.tags || [],
            expiry_date: document.expiry_date ? document.expiry_date.split('T')[0] : '',
            notes: document.notes || '',
            fields: document.fields.map((f) => ({
                label: f.label,
                field_value: f.field_value,
                is_secret: f.is_secret || false,
                field_type: f.field_type || 'text',
                sort_order: f.sort_order || 0,
            })),
        });
        setShowDocumentForm(true);
    };

    const saveDocument = async () => {
        if (!documentForm.title.trim()) return;

        try {
            if (editingDocument) {
                // Update existing document
                const response = await fetch(`/api/documents/${editingDocument.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: documentForm.title,
                        category: documentForm.category,
                        document_type: documentForm.document_type,
                        is_encrypted: documentForm.is_encrypted,
                        tags: documentForm.tags,
                        expiry_date: documentForm.expiry_date || null,
                        notes: documentForm.notes,
                    }),
                });

                if (!response.ok) throw new Error('Failed to update document');

                const updatedDoc = await response.json();

                // Update fields separately
                for (const field of documentForm.fields) {
                    await fetch('/api/document-fields', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            document_id: updatedDoc.id,
                            ...field,
                        }),
                    });
                }

                // Update local state
                setDocuments((prev) =>
                    prev.map((doc) =>
                        doc.id === editingDocument.id
                            ? {
                                  ...updatedDoc,
                                  fields: documentForm.fields.map((f, i) => ({
                                      ...f,
                                      id: `${updatedDoc.id}-${i}`,
                                      document_id: updatedDoc.id,
                                      user_id: 'user-1',
                                      created_at: new Date().toISOString(),
                                      updated_at: new Date().toISOString(),
                                  })),
                              }
                            : doc
                    )
                );
            } else {
                // Create new document
                const response = await fetch('/api/documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: documentForm.title,
                        category: documentForm.category,
                        document_type: documentForm.document_type,
                        is_encrypted: documentForm.is_encrypted,
                        tags: documentForm.tags,
                        expiry_date: documentForm.expiry_date || null,
                        notes: documentForm.notes,
                    }),
                });

                if (!response.ok) throw new Error('Failed to create document');

                const newDoc = await response.json();

                // Add fields
                const createdFields = [];
                for (const field of documentForm.fields) {
                    const fieldResponse = await fetch('/api/document-fields', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            document_id: newDoc.id,
                            ...field,
                        }),
                    });
                    if (fieldResponse.ok) {
                        createdFields.push(await fieldResponse.json());
                    }
                }

                // Add to local state
                setDocuments((prev) => [...prev, { ...newDoc, fields: createdFields }]);
            }

            resetForm();
        } catch (error) {
            console.error('Error saving document:', error);
        }
    };

    const deleteDocument = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete document');

            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch =
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className='flex h-full flex-col'>
            {/* Sticky Header */}
            <div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm pb-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Secure Documents</h1>
                        <p className='text-muted-foreground'>Manage your important documents and credentials securely</p>
                    </div>
                    <button onClick={() => setShowDocumentForm(true)} className='flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                        <Plus className='h-4 w-4' />
                        Add Document
                    </button>
                </div>

                {/* Search and Filters */}
                <div className='mt-6 flex gap-4'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <input
                            type='text'
                            placeholder='Search documents...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary'
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className='rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary'>
                        <option value='all'>All Categories</option>
                        <option value='identity'>Identity</option>
                        <option value='travel'>Travel</option>
                        <option value='financial'>Financial</option>
                        <option value='medical'>Medical</option>
                        <option value='legal'>Legal</option>
                        <option value='personal'>Personal</option>
                        <option value='business'>Business</option>
                    </select>
                </div>
            </div>
            
            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto pt-6'>
                {/* Documents Grid */}
                {filteredDocuments.length > 0 ? (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {filteredDocuments.map((document) => {
                            const CategoryIcon = categoryIcons[document.category as keyof typeof categoryIcons] || FileText;
                            const categoryColor = categoryColors[document.category as keyof typeof categoryColors];

                            return (
                                <div key={document.id} className='rounded-lg border bg-card p-6 transition-shadow hover:shadow-md'>
                                    {/* Document Header */}
                                    <div className='mb-4 flex items-start justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className={`rounded-lg p-2 ${categoryColor}`}>
                                                <CategoryIcon className='h-5 w-5' />
                                            </div>
                                            <div>
                                                <h3 className='font-semibold'>{document.title}</h3>
                                                <p className='text-sm capitalize text-muted-foreground'>{document.category}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            {document.is_encrypted && <Lock className='h-4 w-4 text-green-600' />}
                                            <button onClick={() => openEditForm(document)} className='rounded p-1 hover:bg-accent'>
                                                <Edit3 className='h-4 w-4' />
                                            </button>
                                            <button onClick={() => deleteDocument(document.id)} className='rounded p-1 text-destructive hover:bg-accent'>
                                                <Trash2 className='h-4 w-4' />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Document Fields */}
                                    <div className='space-y-3'>
                                        {document.fields.map((field) => (
                                            <div key={field.id} className='flex items-center justify-between rounded bg-accent/30 p-3'>
                                                <div className='flex-1'>
                                                    <p className='text-sm font-medium'>{field.label}</p>
                                                    <p className='text-sm text-muted-foreground'>{field.is_secret && !visibleSecrets.has(field.id) ? '••••••••' : field.field_value}</p>
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    {field.is_secret && (
                                                        <button onClick={() => toggleSecretVisibility(field.id)} className='rounded p-1 hover:bg-accent'>
                                                            {visibleSecrets.has(field.id) ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                                        </button>
                                                    )}
                                                    <button onClick={() => copyToClipboard(field.field_value)} className='rounded p-1 hover:bg-accent'>
                                                        <Copy className='h-4 w-4' />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tags and Notes */}
                                    {document.tags && document.tags.length > 0 && (
                                        <div className='mt-4'>
                                            <div className='flex flex-wrap gap-1'>
                                                {document.tags.map((tag, index) => (
                                                    <span key={index} className='rounded bg-primary/10 px-2 py-1 text-xs text-primary'>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {document.notes && <div className='mt-3 rounded bg-muted/50 p-3 text-sm'>{document.notes}</div>}

                                    {document.expiry_date && <div className='mt-3 text-sm text-amber-600'>Expires: {new Date(document.expiry_date).toLocaleDateString()}</div>}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className='py-12 text-center'>
                        <Shield className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                        <h3 className='mb-2 text-lg font-semibold'>No Documents Found</h3>
                        <p className='mb-4 text-muted-foreground'>
                            {searchQuery || filterCategory !== 'all' ? 'No documents match your search criteria.' : 'Get started by adding your first secure document.'}
                        </p>
                        <button onClick={() => setShowDocumentForm(true)} className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                            Add Your First Document
                        </button>
                    </div>
                )}

                <DocumentForm
                    isOpen={showDocumentForm}
                    editingDocument={editingDocument}
                    documentForm={documentForm}
                    newTag={newTag}
                    setNewTag={setNewTag}
                    setDocumentForm={setDocumentForm}
                    onSave={saveDocument}
                    onCancel={resetForm}
                />
            </div>
        </div>
    );
}