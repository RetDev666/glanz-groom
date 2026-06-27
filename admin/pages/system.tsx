import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SystemPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        if (user.role !== 'developer') {
          window.location.href = '/';
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (userRole === 'developer') {
      fetchLogs();
    }
  }, [userRole]);

  const fetchLogs = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/system/audit`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => {
    const token = localStorage.getItem('admin_token');
    const url = `${API}/system/backup`;
    
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('Backup failed');
        return res.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `dev-db-backup-${new Date().toISOString().split('T')[0]}.db`;
        a.click();
      })
      .catch(() => alert('Помилка завантаження бекапу'));
  };

  if (userRole !== 'developer') return <AdminLayout><div className="p-6">Access denied</div></AdminLayout>;

  return (
    <AdminLayout title="Система">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-on-surface">Технічний розділ</h2>
          <button 
            onClick={handleBackup}
            className="bg-surface-container border border-outline px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">download</span>
            Стягнути бекап бази (dev.db)
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
          <div className="p-6 border-b border-outline-variant">
            <h3 className="font-sans font-semibold text-lg text-on-surface">Audit Trail (Логи активності)</h3>
            <p className="text-sm text-on-surface-variant">Останні 100 дій в системі</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-surface-container-low border-b border-outline-variant text-sm">
                <tr>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant whitespace-nowrap">Дата</th>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant whitespace-nowrap">Користувач</th>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant whitespace-nowrap">Дія</th>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant w-full">Деталі</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {loading ? (
                  <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">Завантаження...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">Логів поки немає</td></tr>
                ) : logs.map(l => (
                  <tr key={l.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-on-surface-variant">
                      {new Date(l.createdAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {l.userEmail || <span className="text-on-surface-variant italic">Невідомо</span>}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap font-mono text-xs">
                      <span className="bg-surface-container px-2 py-1 rounded">{l.action}</span>
                    </td>
                    <td className="px-6 py-3 text-on-surface-variant">
                      {l.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
