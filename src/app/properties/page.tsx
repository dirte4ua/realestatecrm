'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Property = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    address: string;
    city: string;
    status: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    createdAt: string;
    updatedAt: string;
};

export default function PropertiesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        address: '',
        city: '',
        status: 'available',
        bedrooms: 0,
        bathrooms: 0,
        sqft: 0,
    });

    // Fetch properties when page loads
    useEffect(() => {
        const fetchProperties = async () => {
            const response = await fetch('/api/properties');
            const data = await response.json();
            setProperties(data);
            setLoading(false);
        };

        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        if (status === 'authenticated') {
            fetchProperties();
        }
    }, [status, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'sqft'
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;
        
        const response = await fetch(`/api/properties/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setProperties(properties.filter(prop => prop.id !== id));
        }
    };

    const handleEdit = (property: Property) => {
        setEditingId(property.id);
        setFormData({
            title: property.title,
            description: property.description || '',
            price: property.price,
            address: property.address,
            city: property.city,
            status: property.status,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            sqft: property.sqft,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: '', description: '', price: 0, address: '',
            city: '', status: 'available', bedrooms: 0, bathrooms: 0, sqft: 0
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingId ? `/api/properties/${editingId}` : '/api/properties';
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            // Clear form
            setFormData({
                title: '', description: '', price: 0, address: '',
                city: '', status: 'available', bedrooms: 0, bathrooms: 0, sqft: 0
            });
            setEditingId(null);

            // Refresh the list
            const newProperties = await fetch('/api/properties');
            const data = await newProperties.json();
            setProperties(data);
        }
    };

    if (status === 'loading' || loading) return <div className="p-8">Loading...</div>;
    if (status === 'unauthenticated') return null;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Properties</h1>
            <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{editingId ? 'Edit Property' : 'Add New Property'}</h2>
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
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Title"
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />

                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Address"
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />

                    <input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />

                    <input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Price"
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />

                    <input
                        name="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        placeholder="Bedrooms"
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />

                    <input
                        name="bathrooms"
                        type="number"
                        step="0.5"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        placeholder="Bathrooms"
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />

                    <input
                        name="sqft"
                        type="number"
                        value={formData.sqft}
                        onChange={handleInputChange}
                        placeholder="Square Feet"
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    rows={3}
                    className="w-full p-2 border rounded mt-4 dark:bg-gray-700 dark:border-gray-600"
                />

                <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {editingId ? 'Update Property' : 'Add Property'}
                </button>
            </form>
            {properties.length === 0 ? (
                <p>No properties yet. Add your first property!</p>
            ) : (
                <div className="overflow-x-auto">

                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Title</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Address</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">City</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Price</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Beds</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Baths</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Sqft</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Status</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map((property) => (
                                <tr key={property.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{property.title}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{property.address}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{property.city}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">${property.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{property.bedrooms}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{property.bathrooms}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{property.sqft.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm">
                                            {property.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(property)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(property.id)}
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