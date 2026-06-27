import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SystemPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const { t } = useAdminLang();

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
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        console.error('Expected array, got:', data);
        setLogs([]);
      }
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
            {t.system.downloadBackup}
          </button>
        </div>
        <p className="text-on-surface-variant font-sans">{t.system.description}</p>

        <div className="bg-surface rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">{t.system.tableHeaders[0]}</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">{t.system.tableHeaders[1]}</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">{t.system.tableHeaders[2]}</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">{t.system.tableHeaders[3]}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">{t.loading}</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">{t.system.noLogs}</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-sans text-on-surface whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('de-DE')}
                    </td>
                    <td className="px-6 py-4 font-sans text-on-surface-variant">
                      {log.userEmail || t.system.autoCreated}
                    </td>
                    <td className="px-6 py-4 font-sans font-medium text-on-surface">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 font-sans text-on-surface-variant max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
