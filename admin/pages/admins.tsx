import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [userRole, setUserRole] = useState('');

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
      setAdmins(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'developer') fetchAdmins();
  }, [userRole]);

  const handleCreate = async () => {
    if (!name || !email || !password) return;
    setCreating(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        setName('');
        setEmail('');
        setPassword('');
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
    if (!confirm('Ви впевнені, що хочете видалити цього адміністратора?')) return;
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
    } catch (e) {
      alert('Error deleting admin');
    }
  };

  if (userRole !== 'developer') return <AdminLayout><div className="p-6">Access denied</div></AdminLayout>;

  return (
    <AdminLayout title="Адміністратори">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-on-surface">Керування адміністраторами</h2>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
          <h3 className="font-sans font-semibold text-lg text-on-surface">Додати нового адміністратора</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Ім'я" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="flex-1 bg-surface border border-outline rounded-xl px-4 py-2"
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="flex-1 bg-surface border border-outline rounded-xl px-4 py-2"
            />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="flex-1 bg-surface border border-outline rounded-xl px-4 py-2"
            />
            <button 
              onClick={handleCreate} 
              disabled={creating || !name || !email || !password}
              className="bg-primary text-on-primary px-6 py-2 rounded-xl font-semibold disabled:opacity-50"
            >
              Створити
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
          <table className="w-full text-left font-sans">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">Ім'я</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">Email</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant">Роль</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">Завантаження...</td></tr>
              ) : admins.map(a => (
                <tr key={a.id} className="hover:bg-surface-container-low/50">
                  <td className="px-6 py-4">{a.name}</td>
                  <td className="px-6 py-4">{a.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${a.role === 'developer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {a.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.role !== 'developer' && (
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Видалити"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
