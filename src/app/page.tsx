'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Stats = {
  properties: number;
  clients: number;
  leads: number;
  appointments: number;
};

type Appointment = {
  id: string;
  title: string;
  date: string;
  type: string;
  property: { title: string } | null;
  client: { name: string } | null;
  lead: { name: string } | null;
};

type Lead = {
  id: string;
  name: string;
  status: string;
  source: string | null;
  createdAt: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ properties: 0, clients: 0, leads: 0, appointments: 0 });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated') return;
    const fetchData = async () => {
      const [propertiesRes, clientsRes, leadsRes, appointmentsRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/clients'),
        fetch('/api/leads'),
        fetch('/api/appointments'),
      ]);

      const [properties, clients, leads, appointments] = await Promise.all([
        propertiesRes.json(),
        clientsRes.json(),
        leadsRes.json(),
        appointmentsRes.json(),
      ]);

      setStats({
        properties: properties.length,
        clients: clients.length,
        leads: leads.length,
        appointments: appointments.length,
      });

      // Get upcoming appointments (next 5, sorted by date)
      const upcoming = appointments
        .filter((apt: Appointment) => new Date(apt.date) > new Date())
        .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      setUpcomingAppointments(upcoming);

      // Get recent leads (last 5, sorted by createdAt)
      const recent = leads
        .sort((a: Lead, b: Lead) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentLeads(recent);

      setLoading(false);
    };

    fetchData();
  }, [status, router]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (status === 'loading' || loading) return <div className="p-8">Loading...</div>;
  if (status === 'unauthenticated') return null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/properties" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Properties</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.properties}</div>
          <div className="text-blue-600 dark:text-blue-400 text-sm mt-2">View all →</div>
        </Link>

        <Link href="/clients" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Clients</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.clients}</div>
          <div className="text-blue-600 dark:text-blue-400 text-sm mt-2">View all →</div>
        </Link>

        <Link href="/leads" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Leads</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.leads}</div>
          <div className="text-blue-600 dark:text-blue-400 text-sm mt-2">View all →</div>
        </Link>

        <Link href="/appointments" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Appointments</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.appointments}</div>
          <div className="text-blue-600 dark:text-blue-400 text-sm mt-2">View all →</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{apt.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{formatDateTime(apt.date)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {apt.property?.title || apt.client?.name || apt.lead?.name || 'No contact'}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/appointments" className="block mt-4 text-blue-600 dark:text-blue-400 hover:underline">
            View all appointments →
          </Link>
        </div>

        {/* Recent Leads */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recent Leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No leads yet</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">{lead.source || 'Unknown source'}</div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs capitalize">
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link href="/leads" className="block mt-4 text-blue-600 dark:text-blue-400 hover:underline">
            View all leads →
          </Link>
        </div>
      </div>
    </div>
  );
}
