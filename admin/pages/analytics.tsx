import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

const API = process.env.NEXT_PUBLIC_API_URL;

const COLORS = ['#e63462', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const { t } = useAdminLang();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'last30' | 'all'>('month');

  useEffect(() => { fetchAppointments(); }, [dateRange]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      let fromDate = new Date(0);
      let toDate = new Date();
      if (dateRange === 'week') {
        fromDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        toDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      } else if (dateRange === 'month') {
        fromDate = startOfMonth(new Date());
        toDate = endOfMonth(new Date());
      } else if (dateRange === 'last30') {
        fromDate = subDays(new Date(), 30);
      }
      const res = await fetch(`${API}/appointments?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAppointments(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const completed = appointments.filter(a => a.status === 'completed');
  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');
  const totalRevenue = completed.reduce((s, a) => s + (a.totalPrice || 0), 0);
  const avgRevenue = completed.length > 0 ? totalRevenue / completed.length : 0;

  // Revenue by day
  const revenueByDay = useMemo(() => {
    const days = dateRange === 'all' ? 30 : dateRange === 'last30' ? 30 : dateRange === 'month' ? 30 : 7;
    const start = subDays(new Date(), days - 1);
    return eachDayOfInterval({ start, end: new Date() }).map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayApts = completed.filter(a => String(a.date).startsWith(dayStr));
      return {
        label: format(day, 'dd.MM', { locale: de }),
        revenue: dayApts.reduce((s, a) => s + (a.totalPrice || 0), 0),
        count: dayApts.length,
      };
    });
  }, [completed, dateRange]);

  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);

  // Revenue by groomer
  const groomerStats = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; count: number }> = {};
    completed.forEach(a => {
      const name = String(a.groomer?.name || 'Unbekannt');
      if (!map[name]) map[name] = { name, revenue: 0, count: 0 };
      map[name].revenue += a.totalPrice || 0;
      map[name].count += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [completed]);

  // Top services
  const serviceStats = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    completed.forEach(a => {
      (a.services || []).forEach((s: any) => {
        const name = String(s.service?.nameDe || s.service?.name || 'Service');
        if (!map[name]) map[name] = { name, count: 0, revenue: 0 };
        map[name].count += 1;
        map[name].revenue += s.price || 0;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [completed]);

  const maxServiceRevenue = Math.max(...serviceStats.map(s => s.revenue), 1);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Finanzanalysen</h2>
            <p className="font-sans text-on-surface-variant text-sm">Einnahmen, Termine und Statistik</p>
          </div>
          <div className="bg-white rounded-xl p-1 flex border border-gray-200 shadow-sm gap-1">
            {(['week', 'month', 'last30', 'all'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${dateRange === r ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {r === 'week' ? 'Diese Woche' : r === 'month' ? 'Dieser Monat' : r === 'last30' ? 'Letzte 30 Tage' : 'Gesamt'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <span className="material-symbols-outlined text-5xl animate-spin block mb-3">progress_activity</span>
            Wird geladen...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">Gesamteinnahmen</span>
                </div>
                <p className="font-display text-3xl font-bold text-gray-900">{totalRevenue.toFixed(0)}€</p>
                <p className="text-xs text-gray-400 mt-1">abgeschlossene Termine</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">Abgeschlossen</span>
                </div>
                <p className="font-display text-3xl font-bold text-gray-900">{completed.length}</p>
                <p className="text-xs text-gray-400 mt-1">Termine fertig</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">trending_up</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">Ø pro Termin</span>
                </div>
                <p className="font-display text-3xl font-bold text-gray-900">{avgRevenue.toFixed(0)}€</p>
                <p className="text-xs text-gray-400 mt-1">Durchschnitt</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">schedule</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">Ausstehend</span>
                </div>
                <p className="font-display text-3xl font-bold text-gray-900">{pending.length + confirmed.length}</p>
                <p className="text-xs text-gray-400 mt-1">anstehende Termine</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Terminstatus-Übersicht</h3>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Abgeschlossen', count: completed.length, color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
                  { label: 'Bestätigt', count: confirmed.length, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
                  { label: 'Ausstehend', count: pending.length, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                  { label: 'Storniert', count: cancelled.length, color: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' },
                ].map(s => (
                  <div key={s.label} className={`flex-1 min-w-[120px] ${s.bg} rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-xs text-gray-500">{s.label}</span>
                    </div>
                    <p className={`font-display text-2xl font-bold ${s.text}`}>{s.count}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {appointments.length > 0 ? Math.round(s.count / appointments.length * 100) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Einnahmen pro Tag</h3>
              <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                {revenueByDay.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[28px] flex-1 group relative">
                    <div
                      className="w-full bg-primary rounded-t-md transition-all duration-300 hover:opacity-80 relative"
                      style={{ height: `${day.revenue > 0 ? Math.max(4, (day.revenue / maxRevenue) * 120) : 2}px` }}
                    >
                      {day.revenue > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {day.revenue}€
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 rotate-45 origin-left mt-1 whitespace-nowrap">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Einnahmen nach Groomer</h3>
                {groomerStats.length === 0 ? (
                  <p className="text-gray-400 text-sm py-4 text-center">Keine Daten</p>
                ) : (
                  <div className="space-y-3">
                    {groomerStats.map((g, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                              {g.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{g.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{g.revenue.toFixed(0)}€</span>
                            <span className="text-xs text-gray-400 ml-2">({g.count} Termine)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${(g.revenue / (groomerStats[0]?.revenue || 1)) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Top Dienstleistungen</h3>
                {serviceStats.length === 0 ? (
                  <p className="text-gray-400 text-sm py-4 text-center">Keine Daten</p>
                ) : (
                  <div className="space-y-3">
                    {serviceStats.map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{s.name}</span>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-sm font-bold text-gray-900">{s.revenue.toFixed(0)}€</span>
                            <span className="text-xs text-gray-400 ml-2">×{s.count}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${(s.revenue / maxServiceRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
