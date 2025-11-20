'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Lead = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    source: string | null;
    createdAt: string;
    updatedAt: string;
};

export default function LeadsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'new',
        source: 'website',
    });

    // Fetch leads when page loads
    useEffect(() => {
        const fetchLeads = async () => {
            const response = await fetch('/api/leads');
            const data = await response.json();
            setLeads(data);
            setLoading(false);
        }
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        if (status === 'authenticated') {
            fetchLeads();
        }
    }, [status, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;
        
        const response = await fetch(`/api/leads/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setLeads(leads.filter(lead => lead.id !== id));
        }
    };

    const handleEdit = (lead: Lead) => {
        setEditingId(lead.id);
        setFormData({
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone || '',
            status: lead.status,
            source: lead.source || 'website',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            status: 'new',
            source: 'website',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const url = editingId ? `/api/leads/${editingId}` : '/api/leads';
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const newLeads = await fetch('/api/leads');
            const data = await newLeads.json();
            setLeads(data);
            
            setFormData({
                name: '',
                email: '',
                phone: '',
                status: 'new',
                source: 'website',
            });
            setEditingId(null);
        }
    };

    if (status === 'loading' || loading) return <div className="p-8">Loading...</div>;
    if (status === 'unauthenticated') return null;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Leads</h1>

            <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{editingId ? 'Edit Lead' : 'Add New Lead'}</h2>
                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleSelectChange}
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="closed">Closed</option>
                    </select>

                    <select
                        name="source"
                        value={formData.source}
                        onChange={handleSelectChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="cold-call">Cold Call</option>
                        <option value="social-media">Social Media</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {editingId ? 'Update Lead' : 'Add Lead'}
                </button>
            </form>

            {leads.length === 0 ? (
                <p>No leads yet. Add your first lead!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Name</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Email</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Phone</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Source</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Status</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr key={lead.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{lead.name}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{lead.email || 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{lead.phone || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-sm capitalize">
                                            {lead.source || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm capitalize">
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(lead)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lead.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
