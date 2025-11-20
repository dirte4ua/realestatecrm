'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TimePicker from '@/components/TimePicker';

type Property = {
    id: string;
    title: string;
};

type Client = {
    id: string;
    name: string;
};

type Lead = {
    id: string;
    name: string;
};

type Appointment = {
    id: string;
    title: string;
    description: string | null;
    date: string;
    endDate: string | null;
    type: string;
    status: string;
    property: Property | null;
    client: Client | null;
    lead: Lead | null;
    createdAt: string;
    updatedAt: string;
};

export default function AppointmentsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'showing',
        status: 'scheduled',
        propertyId: '',
        clientId: '',
        leadId: '',
    });

    // Fetch all data when page loads
    useEffect(() => {
        const fetchData = async () => {
            const [appointmentsRes, propertiesRes, clientsRes, leadsRes] = await Promise.all([
                fetch('/api/appointments'),
                fetch('/api/properties'),
                fetch('/api/clients'),
                fetch('/api/leads'),
            ]);

            const [appointmentsData, propertiesData, clientsData, leadsData] = await Promise.all([
                appointmentsRes.json(),
                propertiesRes.json(),
                clientsRes.json(),
                leadsRes.json(),
            ]);

            setAppointments(appointmentsData);
            setProperties(propertiesData);
            setClients(clientsData);
            setLeads(leadsData);
            setLoading(false);
        };

        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status, router]);

    const calculateEndTime = (startTime: string): string => {
        if (!startTime) return '';
        const [hours, minutes] = startTime.split(':').map(Number);
        let endHour = hours + 1;
        if (endHour >= 24) endHour = endHour - 24;
        return `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        if (!confirm('Are you sure you want to delete this appointment?')) return;
        
        const response = await fetch(`/api/appointments/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setAppointments(appointments.filter(apt => apt.id !== id));
        }
    };

    const handleEdit = (appointment: Appointment) => {
        const startDate = new Date(appointment.date);
        const endDate = appointment.endDate ? new Date(appointment.endDate) : null;
        
        setEditingId(appointment.id);
        setFormData({
            title: appointment.title,
            description: appointment.description || '',
            date: startDate.toISOString().split('T')[0],
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate ? endDate.toTimeString().slice(0, 5) : '',
            type: appointment.type,
            status: appointment.status,
            propertyId: appointment.property?.id || '',
            clientId: appointment.client?.id || '',
            leadId: appointment.lead?.id || '',
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            date: '',
            startTime: '',
            endTime: '',
            type: 'showing',
            status: 'scheduled',
            propertyId: '',
            clientId: '',
            leadId: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Combine date and times into ISO datetime strings
        const startDatetime = `${formData.date}T${formData.startTime}`;
        const endDatetime = `${formData.date}T${formData.endTime}`;
        
        const url = editingId ? `/api/appointments/${editingId}` : '/api/appointments';
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                date: startDatetime,
                endDate: endDatetime,
            }),
        });

        if (response.ok) {
            const newAppointments = await fetch('/api/appointments');
            const data = await newAppointments.json();
            setAppointments(data);
            
            setFormData({
                title: '',
                description: '',
                date: '',
                startTime: '',
                endTime: '',
                type: 'showing',
                status: 'scheduled',
                propertyId: '',
                clientId: '',
                leadId: '',
            });
            setEditingId(null);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Appointments</h1>

            <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{editingId ? 'Edit Appointment' : 'Schedule New Appointment'}</h2>
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
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />

                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                        <TimePicker
                            value={formData.startTime}
                            onChange={(startTime) => {
                                const endTime = calculateEndTime(startTime);
                                setFormData(prev => ({ ...prev, startTime, endTime }));
                            }}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                        <TimePicker
                            value={formData.endTime}
                            onChange={(endTime) => setFormData(prev => ({ ...prev, endTime }))}
                            required
                        />
                    </div>

                    <textarea
                        name="description"
                        placeholder="Description (optional)"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 col-span-2"
                        rows={3}
                    />

                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleSelectChange}
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="showing">Showing</option>
                        <option value="meeting">Meeting</option>
                        <option value="call">Call</option>
                    </select>

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleSelectChange}
                        required
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        name="propertyId"
                        value={formData.propertyId}
                        onChange={handleSelectChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="">No Property</option>
                        {properties.map((property) => (
                            <option key={property.id} value={property.id}>
                                {property.title}
                            </option>
                        ))}
                    </select>

                    <select
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleSelectChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="">No Client</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="leadId"
                        value={formData.leadId}
                        onChange={handleSelectChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="">No Lead</option>
                        {leads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                                {lead.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {editingId ? 'Update Appointment' : 'Schedule Appointment'}
                </button>
            </form>

            {appointments.length === 0 ? (
                <p>No appointments scheduled. Create your first appointment!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Title</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Start Time</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">End Time</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Duration</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Type</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Status</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Property</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Client</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Lead</th>
                                <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => {
                                const startTime = new Date(appointment.date);
                                const endTime = appointment.endDate ? new Date(appointment.endDate) : null;
                                const durationMinutes = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : 0;
                                const hours = Math.floor(durationMinutes / 60);
                                const minutes = durationMinutes % 60;
                                const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                                return (
                                    <tr key={appointment.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{appointment.title}</td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{formatDateTime(appointment.date)}</td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                            {endTime ? formatDateTime(appointment.endDate!) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{endTime ? durationText : 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-sm capitalize">
                                                {appointment.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-sm capitalize ${
                                                appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{appointment.property?.title || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{appointment.client?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{appointment.lead?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(appointment)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(appointment.id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
