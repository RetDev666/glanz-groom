import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

type Client = Record<string, unknown>;

function ClientDetailModal({ clientId, onClose, onRefresh }: { clientId: number; onClose: () => void; onRefresh: () => void }) {
  const router = useRouter();
  const { t } = useAdminLang();
  const [client, setClient] = useState<Record<string, unknown> | null>(null);
  const [editingClient, setEditingClient] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [clientForm, setClientForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [petForm, setPetForm] = useState({ name: '', breed: '', size: 'm' });
  const [saving, setSaving] = useState(false);

  const loadClient = () => {
    const token = localStorage.getItem('admin_token');
    fetch(`${API}/clients/${clientId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setClient(d);
        setClientForm({ firstName: String(d.firstName || ''), lastName: String(d.lastName || ''), phone: String(d.phone || ''), email: String(d.email || '') });
      })
      .catch(() => {});
  };

  useEffect(() => { loadClient(); }, [clientId]);

  const saveClient = async () => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    await fetch(`${API}/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(clientForm),
    });
    setSaving(false);
    setEditingClient(false);
    loadClient();
    onRefresh();
  };

  const savePet = async (petId: number) => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    await fetch(`${API}/pets/${petId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(petForm),
    });
    setSaving(false);
    setEditingPetId(null);
    loadClient();
  };

  if (!client) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-2xl">
          <p className="font-sans text-on-surface-variant">{t.loading}</p>
        </div>
      </div>
    );
  }

  const pets = client.pets as Record<string, unknown>[] || [];
  const appointments = client.appointments as Record<string, unknown>[] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-outline-variant" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center font-display font-bold text-on-primary-fixed text-xl shrink-0">
              {String(client.firstName || '?').charAt(0)}{String(client.lastName || '').charAt(0)}
            </div>
            <div>
              {editingClient ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input className="border border-outline rounded-lg px-2 py-1 text-sm w-full" value={clientForm.firstName} onChange={e => setClientForm({...clientForm, firstName: e.target.value})} placeholder="Vorname" />
                    <input className="border border-outline rounded-lg px-2 py-1 text-sm w-full" value={clientForm.lastName} onChange={e => setClientForm({...clientForm, lastName: e.target.value})} placeholder="Nachname" />
                  </div>
                  <input className="border border-outline rounded-lg px-2 py-1 text-sm w-full" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} placeholder="Telefon" />
                  <input className="border border-outline rounded-lg px-2 py-1 text-sm w-full" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} placeholder="E-Mail" />
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveClient} disabled={saving} className="px-3 py-1 bg-primary text-on-primary rounded-lg text-sm font-medium">{saving ? '...' : 'Speichern'}</button>
                    <button onClick={() => setEditingClient(false)} className="px-3 py-1 border border-outline rounded-lg text-sm">Abbrechen</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-headline-sm text-on-surface">{String(client.firstName)} {String(client.lastName)}</h3>
                  <p className="font-sans text-label-md text-on-surface-variant">{String(client.email)}</p>
                  <p className="font-sans text-label-md text-on-surface-variant">{String(client.phone)}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {!editingClient && (
              <button onClick={() => setEditingClient(true)} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors" title="Kundendaten bearbeiten">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Pets */}
          {pets.length > 0 && (
            <div>
              <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-3">{t.clients.petsLabel}</p>
              <div className="flex flex-wrap gap-2">
                {pets.map((pet, i) => (
                  <div key={i} className="bg-surface-container-low rounded-2xl px-4 py-3 border border-outline-variant w-full">
                    {editingPetId === Number(pet.id) ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <input className="border border-outline rounded-lg px-2 py-1 text-sm" value={petForm.name} onChange={e => setPetForm({...petForm, name: e.target.value})} placeholder="Name" />
                          <input className="border border-outline rounded-lg px-2 py-1 text-sm" value={petForm.breed} onChange={e => setPetForm({...petForm, breed: e.target.value})} placeholder="Rasse" />
                          <select className="border border-outline rounded-lg px-2 py-1 text-sm" value={petForm.size} onChange={e => setPetForm({...petForm, size: e.target.value})}>
                            <option value="xs">XS</option><option value="s">S</option><option value="m">M</option><option value="l">L</option><option value="xl">XL</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => savePet(Number(pet.id))} disabled={saving} className="px-3 py-1 bg-primary text-on-primary rounded-lg text-sm font-medium">{saving ? '...' : 'Speichern'}</button>
                          <button onClick={() => setEditingPetId(null)} className="px-3 py-1 border border-outline rounded-lg text-sm">Abbrechen</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined fill text-primary text-[20px]">pets</span>
                          <div>
                            <p className="font-sans text-label-lg text-on-surface">{String(pet.name)}</p>
                            <p className="font-sans text-label-sm text-on-surface-variant">{String(pet.breed || '—')} · {String(pet.size || '').toUpperCase()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setEditingPetId(Number(pet.id)); setPetForm({ name: String(pet.name || ''), breed: String(pet.breed || ''), size: String(pet.size || 'm') }); }}
                          className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments history */}
          <div>
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-3">
              {t.clients.appointmentsLabel} ({appointments.length})
            </p>
            {appointments.length === 0 ? (
              <p className="font-sans text-on-surface-variant text-center py-4">{t.clients.noAppointments}</p>
            ) : (
              <div className="space-y-2">
                {appointments.slice().reverse().map((apt, i) => {
                  const groomer = apt.groomer as Record<string, unknown>;
                  const services = apt.services as { service: Record<string, unknown> }[];
                  return (
                    <div
                      key={i}
                      onClick={() => router.push(`/calendar?date=${String(apt.date).split('T')[0]}`)}
                      className="bg-surface-container-low hover:bg-surface-container rounded-2xl p-4 border border-outline-variant cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-sans text-label-lg text-on-surface font-semibold">
                              {new Date(String(apt.date)).toLocaleString('de-DE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`font-sans text-label-sm px-2 py-0.5 rounded-full ${STATUS_COLORS[String(apt.status)] || ''}`}>
                              {t.status[String(apt.status) as keyof typeof t.status] || String(apt.status)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {services?.map((s, j) => (
                              <span key={j} className="font-sans text-label-sm bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                                {String(s.service?.name || '')}
                              </span>
                            ))}
                          </div>
                          <p className="font-sans text-label-sm text-on-surface-variant mt-1">Groomer: {String(groomer?.name || '—')}</p>
                          {Boolean(apt.notes) && (
                            <div className="mt-2 p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
                              <p className="font-sans text-label-sm text-amber-900 line-clamp-3">
                                <span className="font-semibold">Kommentar:</span> {String(apt.notes)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-primary">{String(apt.totalPrice)}€</p>
                          <p className="font-sans text-label-sm text-on-surface-variant">{String(apt.duration)} Min</p>
                          {Boolean(apt.petPhotoUrl) && (
                            <img src={String(apt.petPhotoUrl)} alt="Foto" className="w-12 h-12 rounded-lg object-cover border border-outline-variant mt-2"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { t } = useAdminLang();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const fetchClients = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/clients`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const s = search.toLowerCase();
    return (
      String(c.firstName).toLowerCase().includes(s) ||
      String(c.lastName).toLowerCase().includes(s) ||
      String(c.email).toLowerCase().includes(s) ||
      String(c.phone).includes(s)
    );
  });

  return (
    <AdminLayout title={t.clients.title}>
      {selectedClientId !== null && (
        <ClientDetailModal clientId={selectedClientId} onClose={() => setSelectedClientId(null)} onRefresh={fetchClients} />
      )}

      <header className="sticky top-0 bg-surface border-b border-outline-variant flex justify-between items-center px-6 h-16 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-on-surface">{t.clients.title}</h2>
          <span className="font-sans text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">{clients.length}</span>
        </div>
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.clients.searchPlaceholder}
            className="bg-surface-container-lowest border border-outline-variant rounded-full pl-10 pr-4 py-2 font-sans text-label-lg focus:outline-none focus:border-primary w-64 transition-colors"
          />
        </div>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 font-sans text-on-surface-variant">{t.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined fill text-[48px] text-on-surface-variant/30 block mb-3">group</span>
            <p className="font-sans text-on-surface-variant">{search ? t.clients.noFound : t.clients.empty}</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    {t.clients.tableHeaders.map((h: string) => (
                      <th key={h} className="px-4 py-3 text-left font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {filtered.map((client) => {
                    const pets = client.pets as Record<string, unknown>[] | undefined;
                    const count = (client._count as Record<string, unknown>)?.appointments;
                    return (
                      <tr
                        key={String(client.id)}
                        className="hover:bg-surface-container-low transition-colors cursor-pointer"
                        onClick={() => setSelectedClientId(Number(client.id))}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center font-display font-bold text-on-primary-fixed text-sm shrink-0">
                              {String(client.firstName).charAt(0)}{String(client.lastName).charAt(0)}
                            </div>
                            <div>
                              <p className="font-sans text-label-lg text-on-surface">{String(client.firstName)} {String(client.lastName)}</p>
                              {pets && pets.length > 0 && (
                                <p className="font-sans text-label-sm text-on-surface-variant">
                                  {pets.map(p => `${p.name} (${p.breed})`).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant">{String(client.email)}</td>
                        <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant">{String(client.phone)}</td>
                        <td className="px-4 py-3 font-sans text-body-md text-on-surface">{pets?.length || 0}</td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-label-sm bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                            {t.clients.appointmentsCount(Number(count || 0))}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-sans text-label-sm text-on-surface-variant">
                          {new Date(String(client.createdAt)).toLocaleDateString('de-DE')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
