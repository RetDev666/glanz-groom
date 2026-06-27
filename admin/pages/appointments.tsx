import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

type Appointment = Record<string, unknown>;

function AppointmentDetailModal({
  apt, groomers, onClose, onStatusChange, onSave, t
}: {
  apt: Appointment;
  groomers: Record<string, unknown>[];
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  onSave: (id: number, data: any) => Promise<void>;
  t: ReturnType<typeof useAdminLang>['t'];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(String(apt.status || 'pending'));
  const [groomerId, setGroomerId] = useState(String(apt.groomerId || ''));
  const [date, setDate] = useState(new Date(String(apt.date)).toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);

  const client = apt.client as Record<string, unknown>;
  const pet = apt.pet as Record<string, unknown>;
  const groomer = apt.groomer as Record<string, unknown>;
  const services = apt.services as { service: Record<string, unknown>; price: number }[];

  const handleSave = async () => {
    setLoading(true);
    await onSave(Number(apt.id), {
      status,
      groomerId: Number(groomerId),
      date: new Date(date).toISOString(),
    });
    setLoading(false);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div>
            <h3 className="font-display text-headline-sm text-on-surface">{t.appointments.detailTitle}</h3>
            {!isEditing && (
              <p className="font-sans text-label-sm text-on-surface-variant mt-0.5">
                {new Date(String(apt.date)).toLocaleString('de-DE', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            ) : (
              <button onClick={handleSave} disabled={loading} className="p-2 rounded-full hover:bg-surface-container text-green-600 transition-colors">
                {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {isEditing && (
            <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.appointments.statusLabel}</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none">
                  <option value="pending">{t.appointments.statusOptions.pending}</option>
                  <option value="confirmed">{t.appointments.statusOptions.confirmed}</option>
                  <option value="completed">{t.appointments.statusOptions.completed}</option>
                  <option value="cancelled">{t.appointments.statusOptions.cancelled}</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Groomer</label>
                <select value={groomerId} onChange={e => setGroomerId(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none">
                  {groomers.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.appointments.dateTimeLabel}</label>
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none" />
              </div>
            </div>
          )}

          {!isEditing && Boolean(apt.petPhotoUrl) && (
            <div className="rounded-2xl overflow-hidden border border-outline-variant">
              <img
                src={String(apt.petPhotoUrl)}
                alt={String(pet?.name || '')}
                className="w-full h-48 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">{t.appointments.clientLabel}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-display font-bold text-on-primary-fixed text-sm shrink-0">
                {String(client?.firstName || '?').charAt(0)}{String(client?.lastName || '').charAt(0)}
              </div>
              <div>
                <p className="font-sans text-label-lg text-on-surface">{String(client?.firstName || '')} {String(client?.lastName || '')}</p>
                <p className="font-sans text-label-sm text-on-surface-variant">{String(client?.email || '')} · {String(client?.phone || '')}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">{t.appointments.petLabel}</p>
            <div className="flex justify-between">
              <div>
                <p className="font-sans text-label-lg text-on-surface">{String(pet?.name || '—')}</p>
                <p className="font-sans text-label-sm text-on-surface-variant">{String(pet?.breed || '')} · {t.appointments.sizeLabel}: {String(pet?.size || '').toUpperCase()}</p>
              </div>
              <span className="font-sans text-label-sm bg-surface-container px-3 py-1 rounded-full text-on-surface-variant h-fit">
                Groomer: {String(groomer?.name || '—')}
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">{t.appointments.servicesLabel}</p>
            <div className="space-y-1">
              {services?.map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="font-sans text-label-md text-on-surface">{String(s.service?.name || '')}</span>
                  <span className="font-display font-bold text-primary">{s.price}€</span>
                </div>
              ))}
              {(() => {
                const sumOfServices = services?.reduce((sum, s) => sum + Number(s.price || 0), 0) || 0;
                const aptTotalPrice = Number(apt.totalPrice || 0);
                if (sumOfServices > aptTotalPrice) {
                  return (
                    <div className="flex justify-between text-green-600 pt-1">
                      <span className="font-sans text-label-md font-semibold">Rabatt / Знижка</span>
                      <span className="font-display font-bold">-{sumOfServices - aptTotalPrice}€</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="border-t border-outline-variant pt-2 flex justify-between">
              <span className="font-sans text-label-lg text-on-surface-variant">{t.appointments.durationLabel}: {String(apt.duration)} min</span>
              <span className="font-display font-bold text-primary text-lg">{String(apt.totalPrice)}€</span>
            </div>
          </div>

          {Boolean(apt.notes) && (
            <div className="bg-surface-container-low rounded-2xl p-4">
              <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{t.appointments.notesLabel}</p>
              <p className="font-sans text-body-md text-on-surface">{String(apt.notes)}</p>
            </div>
          )}

          {!isEditing && (
            <div className="flex gap-2 flex-wrap">
              {apt.status === 'pending' && (
                <button
                  onClick={() => onStatusChange(Number(apt.id), 'confirmed')}
                  className="flex-1 bg-blue-600 text-white font-sans text-label-lg py-2.5 rounded-full hover:bg-blue-700 transition-colors"
                >
                  {t.appointments.confirmBtn}
                </button>
              )}
              {apt.status === 'confirmed' && (
                <button
                  onClick={() => onStatusChange(Number(apt.id), 'completed')}
                  className="flex-1 bg-green-600 text-white font-sans text-label-lg py-2.5 rounded-full hover:bg-green-700 transition-colors"
                >
                  {t.appointments.completeBtn}
                </button>
              )}
              {apt.status !== 'cancelled' && (
                <button
                  onClick={() => onStatusChange(Number(apt.id), 'cancelled')}
                  className="flex-1 bg-red-600 text-white font-sans text-label-lg py-2.5 rounded-full hover:bg-red-700 transition-colors"
                >
                  {t.appointments.cancelBtn}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { t } = useAdminLang();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [groomers, setGroomers] = useState<Record<string, unknown>[]>([]);

  const fetchAppointments = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    const params = new URLSearchParams();
    if (filterDate) params.set('date', filterDate);
    if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus);

    try {
      const [aptsRes, groomersRes] = await Promise.all([
        fetch(`${API}/appointments?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/groomers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const data = await aptsRes.json();
      const grs = await groomersRes.json();
      
      const arr = Array.isArray(data) ? data : [];
      setAppointments(arr);
      setGroomers(Array.isArray(grs) ? grs : []);

      if (arr.length > 0) {
        const maxId = Math.max(...arr.map((a: any) => a.id));
        const lastViewed = Number(localStorage.getItem('last_viewed_appointment_id') || 0);
        if (maxId > lastViewed) {
          localStorage.setItem('last_viewed_appointment_id', maxId.toString());
          window.dispatchEvent(new Event('clear-unread-badge'));
        }
      }
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStatus]);

  useEffect(() => { 
    fetchAppointments(); 
    window.addEventListener('new-appointment', fetchAppointments);
    return () => window.removeEventListener('new-appointment', fetchAppointments);
  }, [fetchAppointments]);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${API}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (selectedApt && selectedApt.id === id) {
      setSelectedApt(prev => prev ? { ...prev, status } : null);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm(t.appointments.deleteConfirm)) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`${API}/appointments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setAppointments(prev => prev.filter(a => a.id !== id));
    if (selectedApt?.id === id) setSelectedApt(null);
  };

  const filtered = appointments.filter(apt => {
    if (!search) return true;
    const s = search.toLowerCase();
    const client = apt.client as Record<string, unknown>;
    const pet = apt.pet as Record<string, unknown>;
    return (
      String(client?.firstName || '').toLowerCase().includes(s) ||
      String(client?.lastName || '').toLowerCase().includes(s) ||
      String(client?.phone || '').includes(s) ||
      String(pet?.name || '').toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout title={t.appointments.title}>
      {selectedApt && (
        <AppointmentDetailModal
          apt={selectedApt}
          groomers={groomers}
          t={t}
          onClose={() => setSelectedApt(null)}
          onStatusChange={updateStatus}
          onSave={async (id, data) => {
            const token = localStorage.getItem('admin_token');
            await fetch(`${API}/appointments/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(data),
            });
            fetchAppointments();
          }}
        />
      )}

      <header className="sticky top-0 bg-surface border-b border-outline-variant flex flex-wrap gap-3 items-center justify-between px-6 py-3 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-on-surface">{t.appointments.title}</h2>
          <span className="font-sans text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">{filtered.length}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.appointments.searchPlaceholder}
              className="bg-surface-container-lowest border border-outline-variant rounded-full pl-9 pr-4 py-2 font-sans text-label-lg focus:outline-none focus:border-primary w-52 transition-colors"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2 font-sans text-label-lg focus:outline-none focus:border-primary transition-colors"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2 font-sans text-label-lg focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">{t.appointments.allStatuses}</option>
            <option value="pending">{t.status.pending}</option>
            <option value="confirmed">{t.status.confirmed}</option>
            <option value="completed">{t.status.completed}</option>
            <option value="cancelled">{t.status.cancelled}</option>
          </select>
          {(filterDate || filterStatus !== 'all' || search) && (
            <button
              onClick={() => { setFilterDate(''); setFilterStatus('all'); setSearch(''); }}
              className="text-primary font-sans text-label-sm hover:underline"
            >
              {t.reset}
            </button>
          )}
        </div>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-16 font-sans text-on-surface-variant">{t.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined fill text-[64px] text-on-surface-variant/20 block mb-3">event_note</span>
            <p className="font-sans text-on-surface-variant">{t.appointments.noFound}</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    {t.appointments.tableHeaders.map(h => (
                      <th key={h} className="px-4 py-3 text-left font-sans text-label-sm text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {filtered.map((apt) => {
                    const client = apt.client as Record<string, unknown>;
                    const pet = apt.pet as Record<string, unknown>;
                    const groomer = apt.groomer as Record<string, unknown>;
                    const services = apt.services as { service: Record<string, unknown> }[];
                    return (
                      <tr
                        key={String(apt.id)}
                        className="hover:bg-surface-container-low transition-colors cursor-pointer"
                        onClick={() => setSelectedApt(apt)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-sans text-label-lg text-on-surface font-semibold">
                            {new Date(String(apt.date)).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="font-sans text-label-sm text-on-surface-variant">
                            {new Date(String(apt.date)).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-sans text-label-lg text-on-surface">{String(client?.firstName || '')} {String(client?.lastName || '')}</p>
                          <p className="font-sans text-label-sm text-on-surface-variant">{String(client?.phone || '')}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {Boolean(apt.petPhotoUrl) && (
                              <img
                                src={String(apt.petPhotoUrl)}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                            <div>
                              <p className="font-sans text-label-md text-on-surface">{String(pet?.name || '—')}</p>
                              <p className="font-sans text-label-sm text-on-surface-variant">{String(pet?.breed || '')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {services?.slice(0, 2).map((s, i) => (
                              <span key={i} className="font-sans text-label-sm bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant whitespace-nowrap">
                                {String((s.service as Record<string, unknown>).name)}
                              </span>
                            ))}
                            {services?.length > 2 && (
                              <span className="font-sans text-label-sm text-on-surface-variant">+{services.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-sans text-body-md text-on-surface whitespace-nowrap">{String(groomer?.name || '—')}</td>
                        <td className="px-4 py-3 font-display font-bold text-primary whitespace-nowrap">{String(apt.totalPrice)}€</td>
                        <td className="px-4 py-3">
                          <span className={`font-sans text-label-sm px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[String(apt.status)] || ''}`}>
                            {t.status[String(apt.status) as keyof typeof t.status] || String(apt.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {apt.status === 'pending' && (
                              <button onClick={() => updateStatus(Number(apt.id), 'confirmed')} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title={t.appointments.confirmTitle}>
                                <span className="material-symbols-outlined text-[18px]">check</span>
                              </button>
                            )}
                            {apt.status === 'confirmed' && (
                              <button onClick={() => updateStatus(Number(apt.id), 'completed')} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title={t.appointments.completeTitle}>
                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                              </button>
                            )}
                            <button onClick={() => deleteAppointment(Number(apt.id))} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title={t.appointments.deleteTitle}>
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
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
