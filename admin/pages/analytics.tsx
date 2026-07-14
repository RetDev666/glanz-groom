import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AnalyticsPage() {
  const { t } = useAdminLang();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'month' | 'last30' | 'all'>('month');

  useEffect(() => {
    fetchAppointments();
  }, [dateRange]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      let fromDate = new Date(0);
      let toDate = new Date();
      
      if (dateRange === 'month') {
        fromDate = startOfMonth(new Date());
        toDate = endOfMonth(new Date());
      } else if (dateRange === 'last30') {
        fromDate = subDays(new Date(), 30);
      }

      const res = await fetch(`${API}/appointments?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completedApts = appointments.filter(a => a.status === 'completed');
  const totalRevenue = completedApts.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
  const totalAppointments = completedApts.length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Finanzanalysen</h2>
            <p className="font-sans text-on-surface-variant">Gewinn und Statistik</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-1 flex border border-outline-variant">
            <button 
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateRange === 'month' ? 'bg-white shadow-sm' : 'hover:bg-surface-container-high'}`}
            >
              Dieser Monat
            </button>
            <button 
              onClick={() => setDateRange('last30')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateRange === 'last30' ? 'bg-white shadow-sm' : 'hover:bg-surface-container-high'}`}
            >
              Letzte 30 Tage
            </button>
            <button 
              onClick={() => setDateRange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateRange === 'all' ? 'bg-white shadow-sm' : 'hover:bg-surface-container-high'}`}
            >
              Alle
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">Wird geladen...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">payments</span>
              <h3 className="font-sans text-on-surface-variant font-medium">Gesamteinnahmen (Abgeschlossen)</h3>
              <p className="font-display text-5xl font-bold text-on-surface mt-2">{totalRevenue.toFixed(2)}€</p>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">check_circle</span>
              <h3 className="font-sans text-on-surface-variant font-medium">Abgeschlossene Termine</h3>
              <p className="font-display text-5xl font-bold text-on-surface mt-2">{totalAppointments}</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
