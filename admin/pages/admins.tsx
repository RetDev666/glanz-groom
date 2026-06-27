import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [userRole, setUserRole] = useState('');
  const { t } = useAdminLang();

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        if (user.role !== 'developer') {
          // If somehow navigated here directly
          window.location.href = '/';
        }
      } catch (e) {}
    }
  }, []);

  const fetchAdmins = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/admins`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdmins(data);
      } else {
        console.error('Expected array, got:', data);
        setAdmins([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'developer') fetchAdmins();
  }, [userRole]);

  const handleAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) return;
    setCreating(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAdmin),
      });
      if (res.ok) {
        setNewAdmin({ name: '', email: '', password: '' });
        fetchAdmins();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      alert('Error creating admin');
    }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.admins.deleteConfirm)) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAdmins(admins.filter(a => a.id !== id));
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (userRole !== 'developer') return <AdminLayout><div className="p-6">Access denied</div></AdminLayout>;

  return (
    <AdminLayout title={t.admins.title}>
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-on-surface">{t.admins.manageTitle}</h2>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-sm space-y-4">
          <h3 className="font-sans font-semibold text-lg text-on-surface">{t.admins.addTitle}</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <input 
                type="text" 
                placeholder={t.admins.namePlaceholder} 
                value={newAdmin.name} 
                onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <input 
                type="email" 
                placeholder={t.admins.emailPlaceholder} 
                value={newAdmin.email} 
                onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <input 
                type="password" 
                placeholder={t.admins.passwordPlaceholder} 
                value={newAdmin.password} 
                onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2"
              />
            </div>
            <button onClick={handleAddAdmin} className="bg-primary text-on-primary px-6 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              {t.admins.createBtn}
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">{t.admins.tableHeaders[0]}</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">{t.admins.tableHeaders[1]}</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">{t.admins.tableHeaders[2]}</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-right">{t.admins.tableHeaders[3]}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">{t.loading}</td></tr>
              ) : (
                admins.map(admin => (
                  <tr key={admin.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-sans text-on-surface">{admin.name}</td>
                    <td className="px-6 py-4 font-sans text-on-surface-variant">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {admin.role !== 'developer' && (
                        <button 
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 text-error hover:bg-error-container hover:text-on-error-container rounded-full transition-colors"
                          title={t.delete}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
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
