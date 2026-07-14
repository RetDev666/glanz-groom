import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

const API = process.env.NEXT_PUBLIC_API_URL;

// Generate 30-minute intervals from 9:00 to 20:00
const HOURS: string[] = [];
for (let i = 9; i <= 20; i++) {
  HOURS.push(`${i}:00`);
  HOURS.push(`${i}:30`);
}

const STATUS_THEMES: Record<string, { bg: string, header: string, border: string, text: string }> = {
  pending: { bg: 'bg-[#fff4ce]', header: 'bg-[#fdc003]', border: 'border-[#fdc003]', text: 'text-gray-900' }, 
  confirmed: { bg: 'bg-[#ffe4e3]', header: 'bg-[#ae2f34]', border: 'border-[#ae2f34]', text: 'text-gray-900' },
  completed: { bg: 'bg-[#d4e4fb]', header: 'bg-[#506073]', border: 'border-[#506073]', text: 'text-gray-900' }, 
  cancelled: { bg: 'bg-gray-200', header: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-900' },
  blocked: { bg: 'bg-gray-100', header: 'bg-gray-400', border: 'border-gray-400', text: 'text-gray-800' },
};

const toLocalDateString = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

type Appointment = Record<string, unknown>;

function AppointmentDetailModal({
  apt, groomers, onClose, onSave, t
}: {
  apt: Appointment;
  groomers: Record<string, unknown>[];
  onClose: () => void;
  onSave: (id: number, data: any) => Promise<void>;
  t: ReturnType<typeof useAdminLang>['t'];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(String(apt.status || 'pending'));
  const [groomerId, setGroomerId] = useState(String(apt.groomerId || ''));
  const [date, setDate] = useState(new Date(String(apt.date)).toISOString().slice(0, 16));
  const [notes, setNotes] = useState(String((apt.client as any)?.notes || apt.notes || ''));
  const [loading, setLoading] = useState(false);

  const client = apt.client as Record<string, any>;
  const pet = apt.pet as Record<string, any>;
  const groomer = apt.groomer as Record<string, any>;
  const services = apt.services as { service: Record<string, any>; price: number }[];

  const handleSave = async () => {
    setLoading(true);
    await onSave(Number(apt.id), {
      status,
      groomerId: Number(groomerId),
      date: new Date(date).toISOString(),
      notes,
    });
    setLoading(false);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Modal content same as before, simplified for brevity */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div>
            <h3 className="font-display text-headline-sm text-on-surface">{t.calendar.detailTitle}</h3>
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
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.calendar.statusLabel}</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none">
                  <option value="pending">{t.calendar.statusOptions.pending}</option>
                  <option value="confirmed">{t.calendar.statusOptions.confirmed}</option>
                  <option value="completed">{t.calendar.statusOptions.completed}</option>
                  <option value="cancelled">{t.calendar.statusOptions.cancelled}</option>
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
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.calendar.dateTimeLabel}</label>
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Kommentar</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none" rows={3}></textarea>
              </div>
            </div>
          )}

          <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">{t.calendar.clientAndPet}</p>
            <p className="font-sans text-label-lg text-on-surface">{String(client?.firstName || '')} {String(client?.lastName || '')} — {String(client?.phone || '')}</p>
            <p className="font-sans text-label-md text-on-surface-variant">{String(pet?.name || '')} ({String(pet?.breed || '')}, {String(pet?.size || '').toUpperCase()})</p>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">{t.calendar.details}</p>
            <p className="font-sans text-body-md text-on-surface flex justify-between">
              <span>Groomer: {String(groomer?.name || '—')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface text-on-surface`}>{String(apt.status)}</span>
            </p>
            <div className="space-y-1 mt-2">
              {services?.map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="font-sans text-label-sm text-on-surface">{String(s.service?.nameUk || s.service?.name || '')}</span>
                  <span className="font-display font-bold text-primary">{s.price}€</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewAppointmentModal({
  groomers, initialDate, initialGroomerId, onClose, onSave, t
}: {
  groomers: Record<string, unknown>[];
  initialDate?: Date;
  initialGroomerId?: number;
  onClose: () => void;
  onSave: () => void;
  t: ReturnType<typeof useAdminLang>['t'];
}) {
  const defaultDate = initialDate ? new Date(initialDate.getTime() - initialDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [form, setForm] = useState({
    date: defaultDate,
    groomerId: String(initialGroomerId || groomers[0]?.id || ''),
    clientFirstName: '',
    clientLastName: '',
    clientPhone: '',
    clientEmail: '',
    petName: '',
    petSize: 'm',
    notes: '',
    serviceIds: [] as number[],
    isBlock: false,
    duration: 60,
  });
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch(`${API}/services/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d) ? d.filter((s:any) => s.isActive) : []));
  }, []);

  const toggleService = (id: number) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id) 
        ? prev.serviceIds.filter(x => x !== id) 
        : [...prev.serviceIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.isBlock) {
      if (!form.clientPhone || !form.petName || !form.date || form.serviceIds.length === 0) {
        return alert('Bitte füllen Sie alle erforderlichen Felder aus');
      }
    } else {
      if (!form.date || !form.duration) {
        return alert('Bitte Datum und Dauer angeben');
      }
    }
    
    setLoading(true);
    const payload = {
      ...form,
      clientEmail: form.clientEmail || `${Date.now()}@no-email.local`,
      date: new Date(form.date).toISOString(),
      groomerId: Number(form.groomerId) || Number(groomers[0]?.id) || 0,
    };

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API}/appointments/admin-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    
    if (res.ok) {
      onSave();
      onClose();
    } else {
      const data = await res.json();
      alert(data.error || 'Fehler beim Erstellen');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="font-display text-headline-sm text-on-surface">Neuer Termin</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-surface-container-low rounded-xl p-1 mb-4 border border-outline-variant">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-sans rounded-lg transition-colors ${!form.isBlock ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
              onClick={() => setForm({ ...form, isBlock: false })}
            >
              Kundenbuchung
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-sans rounded-lg transition-colors ${form.isBlock ? 'bg-error text-on-error shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
              onClick={() => setForm({ ...form, isBlock: true })}
            >
              Zeit blockieren
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.calendar.dateTimeLabel}</label>
              <input type="datetime-local" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" />
            </div>
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Groomer</label>
              <select value={form.groomerId} onChange={e => setForm({...form, groomerId: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none">
                {groomers.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          {!form.isBlock ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Kundenname</label>
                  <input type="text" value={form.clientFirstName} onChange={e => setForm({...form, clientFirstName: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Name" />
                </div>
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Telefon *</label>
                  <input type="tel" required={!form.isBlock} value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="+49..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Tiername *</label>
                  <input type="text" required={!form.isBlock} value={form.petName} onChange={e => setForm({...form, petName: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Name" />
                </div>
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Größe</label>
                  <select value={form.petSize} onChange={e => setForm({...form, petSize: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none">
                    <option value="xs">XS</option><option value="s">S</option><option value="m">M</option><option value="l">L</option><option value="xl">XL</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-2">Leistungen *</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-surface-container-low p-2 rounded-xl border border-outline-variant">
                  {services.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-container rounded">
                      <input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="w-4 h-4 rounded text-primary border-outline-variant" />
                      <span className="text-sm font-sans">{s.nameDe || s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Dauer (Minuten) *</label>
                <select value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none">
                  <option value={15}>15 Min</option>
                  <option value={30}>30 Min</option>
                  <option value={60}>1 Std</option>
                  <option value={90}>1.5 Std</option>
                  <option value={120}>2 Std</option>
                  <option value={240}>Halber Tag (4 Std)</option>
                  <option value={480}>Ganzer Tag (8 Std)</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Grund (Kommentar)</label>
                <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Mittagspause, Urlaub, etc..." />
              </div>
            </div>
          )}
          <div className="pt-4 flex gap-3 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-full border border-outline hover:bg-surface-container transition-colors">Abbrechen</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
              {loading ? 'Wird gespeichert...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { t } = useAdminLang();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [groomers, setGroomers] = useState<Record<string, unknown>[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean, x: number, y: number, apt: Appointment | null }>({ isOpen: false, x: 0, y: 0, apt: null });

  const [newAptModalData, setNewAptModalData] = useState<{isOpen: boolean, date?: Date, groomerId?: number}>({ isOpen: false });

  // Add a state to store breaks (currently simulated, as API doesn't have it yet)
  const [breaks] = useState([{ groomerId: 1, start: '13:15', end: '13:45' }]);

  const fetchAppointments = () => {
    setCurrentDate(new Date(currentDate)); // Trigger effect
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    const handleResponse = async (r: Response) => {
      if (r.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        throw new Error('Unauthorized');
      }
      return r.json();
    };

    let queryDate = '';
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      queryDate = `startDate=${toLocalDateString(start)}&endDate=${toLocalDateString(end)}`;
    } else {
      queryDate = `date=${toLocalDateString(currentDate)}`;
    }

    Promise.all([
      fetch(`${API}/appointments?${queryDate}`, { headers: { Authorization: `Bearer ${token}` } }).then(handleResponse).catch(() => []),
      fetch(`${API}/groomers/all`, { headers: { Authorization: `Bearer ${token}` } }).then(handleResponse).catch(() => []),
    ]).then(([validApts, fetchedGroomers]) => {
      const missingGroomerIds = Array.from(new Set(validApts.map((a: any) => a.groomerId))).filter(
        (id: any) => id && !fetchedGroomers.find((g: any) => Number(g.id) === Number(id))
      );

      const hasNullGroomer = validApts.some((a: any) => !a.groomerId);

      const missingGroomers = missingGroomerIds.map((id) => ({
        id: Number(id),
        name: `Groomer (ID ${id})`,
        color: '#666666',
        photoUrl: 'https://ui-avatars.com/api/?name=G&background=random'
      }));

      if (hasNullGroomer) {
        missingGroomers.push({
          id: 0,
          name: 'Ohne Groomer',
          color: '#aaaaaa',
          photoUrl: 'https://ui-avatars.com/api/?name=O&background=random'
        });
      }

      setAppointments(validApts);
      setGroomers([...fetchedGroomers, ...missingGroomers]);
    });
  }, [currentDate, viewMode]);

  const handleUpdateAppointment = async (id: number, data: any) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${API}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    fetchAppointments();
  };

  const handleDrop = async (e: React.DragEvent, newGroomerId: number) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData('aptId');
    if (!aptId) return;

    const offsetY = Number(e.dataTransfer.getData('offsetY') || 0);
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top - offsetY;

    // Row height is 60px for 30 minutes. 1px = 0.5 minutes
    // Total hours from 9:00
    const minutesFromStart = Math.max(0, y * 0.5);
    const totalMinutes = 9 * 60 + minutesFromStart;
    
    // Snap to 15 min intervals
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;
    
    const hours = Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;

    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);

    await handleUpdateAppointment(Number(aptId), {
      groomerId: newGroomerId,
      date: newDate.toISOString()
    });
  };

  const handleGridClick = (e: React.MouseEvent, groomerId: number) => {
    // Only if clicking on the grid itself, not an appointment
    if (e.target !== e.currentTarget) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 60px = 30 minutes -> 1px = 0.5 minutes
    const minutesFromStart = Math.max(0, y * 0.5);
    const totalMinutes = 9 * 60 + minutesFromStart;
    const snappedMinutes = Math.round(totalMinutes / 30) * 30; // snap to 30 min on click
    
    const hours = Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;

    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);
    
    setNewAptModalData({ isOpen: true, date: newDate, groomerId });
  };

  // 1 hour = 120px height, 30 min = 60px height. Base is 9:00.
  const getTopPosition = (dateStr: string) => {
    const d = new Date(dateStr);
    const minutesDiff = (d.getHours() - 9) * 60 + d.getMinutes();
    return minutesDiff * 2; // 2px per minute
  };

  const getHeight = (duration: number) => duration * 2; // 2px per minute

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'confirmed': return 'schedule';
      case 'pending': return 'schedule';
      case 'cancelled': return 'cancel';
      default: return 'schedule';
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = startOfWeek(currentDate, { weekStartsOn: 1 });
    return addDays(d, i);
  });

  return (
    <AdminLayout title={t.calendar.title}>
      {selectedApt && <AppointmentDetailModal apt={selectedApt} groomers={groomers} t={t} onClose={() => setSelectedApt(null)} onSave={handleUpdateAppointment} />}
      {newAptModalData.isOpen && <NewAppointmentModal 
        groomers={groomers} 
        t={t} 
        initialDate={newAptModalData.date}
        initialGroomerId={newAptModalData.groomerId}
        onClose={() => setNewAptModalData({ isOpen: false })} 
        onSave={fetchAppointments} 
      />}

      {/* Header - Altegio Style */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors group">
          <span className="font-display font-semibold text-xl text-gray-900 group-hover:text-primary transition-colors capitalize">
            {format(currentDate, 'd MMMM', { locale: de })}
          </span>
          <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">expand_more</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('day')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              Tag
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              Woche
            </button>
          </div>
          <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[18px] text-gray-600">group</span>
            <span className="text-sm font-medium text-gray-700">Alle</span>
          </button>
        </div>
      </header>

      {/* Add Button & Today Floating Area */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button 
          onClick={() => setCurrentDate(new Date())}
          className="bg-white px-5 py-3 rounded-full shadow-lg border border-gray-100 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Heute
        </button>
        <button 
          onClick={() => setNewAptModalData({ isOpen: true })}
          className="bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <span className="text-[#ffcc00] font-light text-3xl mb-1">+</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
        
        {/* Horizontal Week Strip */}
        <div className="flex bg-primary text-white shrink-0 overflow-x-auto no-scrollbar pb-1">
          {weekDays.map((d, i) => {
            const isActive = isSameDay(d, currentDate);
            return (
              <div 
                key={i} 
                onClick={() => setCurrentDate(d)}
                className={`flex-1 min-w-[60px] py-2 flex flex-col items-center justify-center cursor-pointer transition-colors rounded-b-xl ${isActive ? 'bg-[#ffcc00] text-gray-900 font-bold shadow-md' : 'hover:bg-white/10 text-white/90'}`}
              >
                <span className="text-[11px] uppercase tracking-wide opacity-80">{format(d, 'EE', { locale: de })}</span>
                <span className="text-lg leading-tight">{format(d, 'd')}</span>
              </div>
            );
          })}
        </div>

        {/* Column Headers (Groomers or Days) */}
        <div className="flex border-b border-gray-100 shrink-0 mt-2">
          <div className="w-16 shrink-0 flex items-center justify-center">
             <button onClick={() => setNewAptModalData({ isOpen: true })} className="text-[#ffcc00] font-light text-2xl hover:scale-110 transition-transform">+</button>
          </div>
          
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${viewMode === 'day' ? Math.max(groomers.length, 1) : 7}, 1fr)` }}>
            {viewMode === 'day' ? (
              (groomers.length > 0 ? groomers : [{ id: 1, name: '—' }]).map((g, i) => (
                <div key={String(g.id)} className="py-3 flex flex-col items-center gap-1">
                  {g.photoUrl ? (
                    <img src={String(g.photoUrl)} alt={String(g.name)} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white shadow-sm" style={{ backgroundColor: String(g.color || '#ccc') }}>
                      {String(g.name).charAt(0)}
                    </div>
                  )}
                  <span className="font-sans text-[13px] font-medium text-gray-800">{String(g.name)}</span>
                </div>
              ))
            ) : (
              weekDays.map((d, i) => (
                <div key={i} className="py-3 flex flex-col items-center justify-center gap-0.5 border-r border-gray-100 last:border-0">
                  <span className="font-display font-medium text-gray-800 capitalize">{format(d, 'EEEE', { locale: de })}</span>
                  <span className="text-xs text-gray-500">{format(d, 'dd.MM')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 flex overflow-y-auto relative pb-32">
          {/* Time Column */}
          <div className="w-16 shrink-0 flex flex-col pt-[10px]">
            {HOURS.map((h, i) => {
              const isFullHour = h.endsWith(':00');
              return (
                <div key={h} className="h-[60px] relative">
                  {isFullHour && (
                    <span className="absolute -top-2.5 right-2 text-[12px] text-gray-500 font-medium">
                      {h}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Groomers or Days Columns */}
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${viewMode === 'day' ? Math.max(groomers.length, 1) : 7}, 1fr)` }}>
            {viewMode === 'day' ? (
              (groomers.length > 0 ? groomers : [{ id: 1 }]).map((g, i, arr) => {
                const gApts = appointments.filter(a => Number(a.groomerId || 0) === Number(g.id) && isSameDay(new Date(String(a.date)), currentDate));
                const gBreaks = breaks.filter(b => Number(b.groomerId || 0) === Number(g.id));

                return (
                  <div
                    key={String(g.id)}
                    className={`relative ${i < arr.length - 1 ? 'border-r border-gray-100' : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, Number(g.id))}
                    onClick={(e) => handleGridClick(e, Number(g.id))}
                  >
                    {/* Grid lines */}
                    {HOURS.map((h) => {
                      const isFullHour = h.endsWith(':00');
                      return (
                        <div key={h} className={`h-[60px] border-b ${isFullHour ? 'border-gray-200' : 'border-gray-100/50'}`} style={{ pointerEvents: 'none' }} />
                      );
                    })}

                    {/* Hatched Break slots */}
                    {gBreaks.map((b, idx) => {
                      const top = getTopPosition(`2000-01-01T${b.start}`);
                      const endTop = getTopPosition(`2000-01-01T${b.end}`);
                      const height = endTop - top;
                      return (
                        <div key={idx} className="absolute left-0 right-0 bg-hatched opacity-50 z-0 border-y border-gray-200" style={{ top: `${top}px`, height: `${height}px`, pointerEvents: 'none' }}>
                           <span className="absolute text-[10px] text-gray-400 bg-white/80 px-1 mt-1 ml-1">{b.start}-{b.end}</span>
                        </div>
                      );
                    })}

                    {/* Appointments */}
                    {gApts.map(apt => {
                      const client = apt.client as Record<string, any>;
                      const servicesList = apt.services as { service: Record<string, any>; price: number }[];
                      const serviceName = String(servicesList?.[0]?.service?.nameDe || servicesList?.[0]?.service?.name || '');
                      const pet = apt.pet as Record<string, any>;
                      const petSize = String(pet?.size || 'm').toUpperCase();
                      
                      const d = new Date(String(apt.date));
                      const endD = new Date(d.getTime() + Number(apt.duration) * 60000);
                      const timeRange = `${format(d, 'H:mm')} - ${format(endD, 'H:mm')}`;

                      const top = getTopPosition(String(apt.date));
                      const height = Math.max(getHeight(Number(apt.duration)), 40);
                      
                      const theme = STATUS_THEMES[String(apt.status)] || STATUS_THEMES.confirmed;

                      return (
                        <div
                          key={String(apt.id)}
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.setData('aptId', String(apt.id));
                            e.dataTransfer.setData('offsetY', String(e.nativeEvent.offsetY));
                          }}
                          onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, apt });
                          }}
                          className={`absolute left-0.5 right-0.5 rounded-md flex flex-col z-10 shadow-sm cursor-move overflow-hidden border ${theme.border} hover:shadow-md transition-shadow`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          <div className={`${theme.header} text-white px-1.5 py-0.5 flex justify-between items-center shrink-0`}>
                            <span className="text-[10px] font-medium leading-none">{timeRange}</span>
                            <span className="material-symbols-outlined text-[12px]">{getStatusIcon(String(apt.status))}</span>
                          </div>
                          
                          <div className={`${theme.bg} flex-1 p-1.5 flex flex-col gap-0.5 overflow-hidden text-gray-800`}>
                            <div className="leading-tight text-[11px]">
                              {client ? <span className="font-semibold">{client.firstName} {client.lastName}</span> : '—'}
                              {client?.phone && <div className="opacity-80 text-[10px]">{client.phone}</div>}
                            </div>
                            
                            {serviceName && (
                              <div className="text-[10px] leading-tight flex gap-1 items-start mt-auto pt-1">
                                <span className="line-clamp-2">{petSize} - {serviceName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              weekDays.map((d, i, arr) => {
                const dayApts = appointments.filter(a => isSameDay(new Date(String(a.date)), d));
                
                return (
                  <div
                    key={i}
                    className={`relative ${i < arr.length - 1 ? 'border-r border-gray-100' : ''}`}
                    onClick={(e) => {
                      // Grid click logic in week view: sets current date to clicked day, and changes to day view
                      if (e.target !== e.currentTarget) return;
                      setCurrentDate(d);
                      setViewMode('day');
                    }}
                  >
                    {/* Grid lines */}
                    {HOURS.map((h) => {
                      const isFullHour = h.endsWith(':00');
                      return (
                        <div key={h} className={`h-[60px] border-b ${isFullHour ? 'border-gray-200' : 'border-gray-100/50'}`} style={{ pointerEvents: 'none' }} />
                      );
                    })}

                    {/* Appointments */}
                    {dayApts.map(apt => {
                      const client = apt.client as Record<string, any>;
                      const groomer = apt.groomer as Record<string, any>;
                      
                      const dStart = new Date(String(apt.date));
                      const endD = new Date(dStart.getTime() + Number(apt.duration) * 60000);
                      const timeRange = `${format(dStart, 'H:mm')} - ${format(endD, 'H:mm')}`;

                      const top = getTopPosition(String(apt.date));
                      const height = Math.max(getHeight(Number(apt.duration)), 40);
                      
                      const theme = STATUS_THEMES[String(apt.status)] || STATUS_THEMES.confirmed;

                      return (
                        <div
                          key={String(apt.id)}
                          onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, apt });
                          }}
                          className={`absolute left-0.5 right-0.5 rounded-md flex flex-col z-10 shadow-sm overflow-hidden border ${theme.border} hover:shadow-md transition-shadow`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          <div className={`${theme.header} text-white px-1.5 py-0.5 flex justify-between items-center shrink-0`}>
                            <span className="text-[10px] font-medium leading-none">{timeRange}</span>
                            <span className="text-[10px] font-bold uppercase truncate max-w-[50px]">{groomer?.name || 'O.G.'}</span>
                          </div>
                          
                          <div className={`${theme.bg} flex-1 p-1 flex flex-col gap-0.5 overflow-hidden text-gray-800`}>
                            <div className="leading-tight text-[10px] font-semibold truncate">
                              {client ? `${client.firstName} ${client.lastName}` : '—'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Context Menu Overlay */}
      {contextMenu.isOpen && contextMenu.apt && (
        <div 
          className="fixed inset-0 z-[100]" 
          onClick={() => setContextMenu({ ...contextMenu, isOpen: false })}
          onContextMenu={(e) => { e.preventDefault(); setContextMenu({ ...contextMenu, isOpen: false }); }}
        >
          <div 
            className="absolute bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-56 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150"
            style={{ top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 224) }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktion wählen</span>
            </div>
            
            <button 
              className="px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
              onClick={() => {
                setSelectedApt(contextMenu.apt);
                setContextMenu({ ...contextMenu, isOpen: false });
              }}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Bearbeiten
            </button>
            
            <button 
              className="px-4 py-2 text-sm text-left hover:bg-orange-50 flex items-center gap-2 text-orange-600 transition-colors"
              onClick={() => {
                handleUpdateAppointment(Number(contextMenu.apt!.id), { status: 'blocked' });
                setContextMenu({ ...contextMenu, isOpen: false });
              }}
            >
              <span className="material-symbols-outlined text-[18px]">person_off</span>
              Kunde nicht erschienen
            </button>

            <button 
              className="px-4 py-2 text-sm text-left hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors"
              onClick={() => {
                handleUpdateAppointment(Number(contextMenu.apt!.id), { status: 'cancelled' });
                setContextMenu({ ...contextMenu, isOpen: false });
              }}
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Stornieren
            </button>

            <div className="h-px bg-gray-100 my-1 mx-2" />
            
            <button 
              className="px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
              onClick={() => {
                setSelectedApt(contextMenu.apt);
                setContextMenu({ ...contextMenu, isOpen: false });
              }}
            >
              <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
              Kommentar hinterlassen
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
