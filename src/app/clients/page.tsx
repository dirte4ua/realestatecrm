'use client';

import { useState, useEffect } from 'react';

type Client = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    type: string;
    createdAt: string;
    updatedAt: string;
};

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'buyer',
    });

    // Fetch clients when page loads
    useEffect(() => {
        const fetchClients = async () => {
            const response = await fetch('/api/clients');
            const data = await response.json();
            setClients(data);
            setLoading(false);
        }
        fetchClients();
    }, []);

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
        if (!confirm('Are you sure you want to delete this client?')) return;
        
        const response = await fetch(`/api/clients/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setClients(clients.filter(client => client.id !== id));
        }
    };

    const handleEdit = (client: Client) => {
        setEditingId(client.id);
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone || '',
            type: client.type,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            type: 'buyer',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const url = editingId ? `/api/clients/${editingId}` : '/api/clients';
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const newClients = await fetch('/api/clients');
            const data = await newClients.json();
            setClients(data);
            
            setFormData({
                name: '',
                email: '',
                phone: '',
                type: 'buyer',
            });
            setEditingId(null);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Clients</h1>

            <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{editingId ? 'Edit Client' : 'Add New Client'}</h2>
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
                        name="type"
                        value={formData.type}
                        onChange={handleSelectChange}
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="both">Both</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {editingId ? 'Update Client' : 'Add Client'}
                </button>
            </form>

            {clients.length === 0 ? (
                <p>No clients yet. Add your first client!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Name</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Email</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Phone</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Type</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{client.name}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{client.email}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{client.phone || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm capitalize">
                                            {client.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(client)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
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
