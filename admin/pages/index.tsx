import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useAdminLang } from '../hooks/useAdminLang';

interface Stats { total: number; pending: number; confirmed: number; completed: number; revenue: number; }

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const { t } = useAdminLang();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, confirmed: 0, completed: 0, revenue: 0 });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    const fetchData = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          const upcoming = arr.filter(a => new Date(String(a.date)) >= new Date(new Date().setHours(0,0,0,0)));
          setAppointments(upcoming);
          setStats({
            total: upcoming.length,
            pending: upcoming.filter(a => a.status === 'pending').length,
            confirmed: upcoming.filter(a => a.status === 'confirmed').length,
            completed: upcoming.filter(a => a.status === 'completed').length,
            revenue: upcoming.filter(a => a.status === 'completed' || a.status === 'confirmed').reduce((sum, a) => sum + Number(a.totalPrice || 0), 0),
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchData();

    window.addEventListener('new-appointment', fetchData);
    return () => window.removeEventListener('new-appointment', fetchData);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const statCards = [
    { label: t.dashboard.upcoming, value: stats.total, icon: 'event_note', color: 'bg-primary-fixed text-on-primary-fixed' },
    { label: t.dashboard.awaiting, value: stats.pending, icon: 'schedule', color: 'bg-amber-100 text-amber-800' },
    { label: t.dashboard.completed, value: stats.completed, icon: 'done_all', color: 'bg-green-100 text-green-800' },
    { label: t.dashboard.revenue, value: `${stats.revenue}€`, icon: 'payments', color: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  ];

  return (
    <AdminLayout title={t.dashboard.title}>
      <header className="sticky top-0 bg-surface border-b border-outline-variant flex justify-between items-center px-6 h-16 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-on-surface">{t.dashboard.title}</h2>
          <span className="font-sans text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <Link href="/calendar" className="flex items-center gap-2 text-sm font-sans text-primary hover:underline">
          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          {t.dashboard.toCalendar}
        </Link>
      </header>

      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                <span className="material-symbols-outlined fill text-[20px]">{card.icon}</span>
              </div>
              <div className="font-display text-3xl font-extrabold text-on-surface">{card.value}</div>
              <div className="font-sans text-label-sm text-on-surface-variant mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-surface-variant">
            <h3 className="font-display text-lg font-bold text-on-surface">{t.dashboard.upcomingTitle}</h3>
            <Link href="/appointments" className="font-sans text-label-sm text-primary hover:underline">{t.dashboard.allAppointments}</Link>
          </div>

          {loading ? (
            <div className="p-8 text-center font-sans text-on-surface-variant">{t.loading}</div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined fill text-[48px] text-on-surface-variant/30 mb-3 block">event_busy</span>
              <p className="font-sans text-on-surface-variant">{t.dashboard.noAppointments}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    {t.dashboard.tableHeaders.map(h => (
                      <th key={h} className="px-4 py-3 text-left font-sans text-label-sm text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {appointments.map((apt) => {
                    const client = apt.client as Record<string, unknown>;
                    const pet = apt.pet as Record<string, unknown>;
                    const groomer = apt.groomer as Record<string, unknown>;
                    const services = apt.services as { service: Record<string, unknown> }[];
                    return (
                      <tr key={String(apt.id)} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 font-sans text-label-lg text-on-surface font-semibold whitespace-nowrap">
                          {new Date(String(apt.date)).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-sans text-body-md text-on-surface whitespace-nowrap">
                          {client ? `${client.firstName} ${client.lastName}` : '—'}
                        </td>
                        <td className="px-4 py-3 font-sans text-body-md text-on-surface whitespace-nowrap">
                          {pet ? `${pet.name} (${pet.breed})` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {services?.map((s, i) => (
                              <span key={i} className="font-sans text-label-sm bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant whitespace-nowrap">
                                {String((s.service as Record<string, unknown>).name)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-sans text-body-md text-on-surface whitespace-nowrap">{String(groomer?.name || '—')}</td>
                        <td className="px-4 py-3 font-display font-bold text-primary whitespace-nowrap">{String(apt.totalPrice)}€</td>
                        <td className="px-4 py-3">
                          <span className={`font-sans text-label-sm px-3 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[String(apt.status)] || 'bg-surface-container text-on-surface'}`}>
                            {t.status[String(apt.status) as keyof typeof t.status] || String(apt.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {apt.status === 'pending' && (
                              <button onClick={() => updateStatus(Number(apt.id), 'confirmed')} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors" title={t.dashboard.confirmTitle}>
                                <span className="material-symbols-outlined text-[18px]">check</span>
                              </button>
                            )}
                            {apt.status === 'confirmed' && (
                              <button onClick={() => updateStatus(Number(apt.id), 'completed')} className="p-1.5 rounded-lg text-green-600 hover:bg-green-100 transition-colors" title={t.dashboard.completeTitle}>
                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                              </button>
                            )}
                            <button onClick={() => updateStatus(Number(apt.id), 'cancelled')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors" title={t.dashboard.cancelTitle}>
                              <span className="material-symbols-outlined text-[18px]">close</span>
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
      </div>
    </AdminLayout>
  );
}
