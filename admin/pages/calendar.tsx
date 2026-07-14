import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { uk } from 'date-fns/locale';

const API = process.env.NEXT_PUBLIC_API_URL;

// Generate 30-minute intervals from 9:00 to 20:00
const HOURS: string[] = [];
for (let i = 9; i <= 20; i++) {
  HOURS.push(`${i}:00`);
  HOURS.push(`${i}:30`);
}

const STATUS_THEMES: Record<string, { bg: string, header: string, border: string, text: string }> = {
  pending: { bg: 'bg-blue-100', header: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-900' },
  confirmed: { bg: 'bg-[#d8cbf5]', header: 'bg-[#8964d8]', border: 'border-[#8964d8]', text: 'text-gray-900' }, // Altegio Purple
  completed: { bg: 'bg-[#b6e8c7]', header: 'bg-[#55b974]', border: 'border-[#55b974]', text: 'text-gray-900' }, // Altegio Green
  cancelled: { bg: 'bg-red-100', header: 'bg-red-500', border: 'border-red-500', text: 'text-red-900' },
  blocked: { bg: 'bg-red-50', header: 'bg-red-500', border: 'border-red-500', text: 'text-red-900' },
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
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Коментар</label>
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
        return alert('Будь ласка, заповніть всі обов\'язкові поля');
      }
    } else {
      if (!form.date || !form.duration) {
        return alert('Будь ласка, вкажіть дату та тривалість');
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
      alert(data.error || 'Помилка при створенні');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="font-display text-headline-sm text-on-surface">Новий запис</h3>
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
              Запис клієнта
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-sans rounded-lg transition-colors ${form.isBlock ? 'bg-error text-on-error shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
              onClick={() => setForm({ ...form, isBlock: true })}
            >
              Заблокувати час
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
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Ім'я клієнта</label>
                  <input type="text" value={form.clientFirstName} onChange={e => setForm({...form, clientFirstName: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Ім'я" />
                </div>
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Телефон *</label>
                  <input type="tel" required={!form.isBlock} value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="+380..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Улюбленець *</label>
                  <input type="text" required={!form.isBlock} value={form.petName} onChange={e => setForm({...form, petName: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Кличка" />
                </div>
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Розмір</label>
                  <select value={form.petSize} onChange={e => setForm({...form, petSize: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none">
                    <option value="xs">XS</option><option value="s">S</option><option value="m">M</option><option value="l">L</option><option value="xl">XL</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-2">Послуги *</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-surface-container-low p-2 rounded-xl border border-outline-variant">
                  {services.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-container rounded">
                      <input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="w-4 h-4 rounded text-primary border-outline-variant" />
                      <span className="text-sm font-sans">{s.nameUk || s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Тривалість (хвилин) *</label>
                <select value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none">
                  <option value={15}>15 хв</option>
                  <option value={30}>30 хв</option>
                  <option value={60}>1 год</option>
                  <option value={90}>1.5 год</option>
                  <option value={120}>2 год</option>
                  <option value={240}>Півдня (4 год)</option>
                  <option value={480}>Весь день (8 год)</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Причина (коментар)</label>
                <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Обід, відпустка тощо..." />
              </div>
            </div>
          )}
          <div className="pt-4 flex gap-3 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-full border border-outline hover:bg-surface-container transition-colors">Скасувати</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
              {loading ? 'Збереження...' : 'Зберегти'}
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
  
  const [newAptModalData, setNewAptModalData] = useState<{isOpen: boolean, date?: Date, groomerId?: number}>({ isOpen: false });

  // Add a state to store breaks (currently simulated, as API doesn't have it yet)
  const [breaks] = useState([{ groomerId: 1, start: '13:15', end: '13:45' }]);

  const fetchAppointments = () => {
    setCurrentDate(new Date(currentDate)); // Trigger effect
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const queryDate = `date=${toLocalDateString(currentDate)}`;

    Promise.all([
      fetch(`${API}/appointments?${queryDate}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
      fetch(`${API}/groomers/all`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
    ]).then(([apts, grs]) => {
      const validApts = Array.isArray(apts) ? apts : [];
      const fetchedGroomers = Array.isArray(grs) ? grs : [];

      const missingGroomerIds = Array.from(new Set(validApts.map((a: any) => a.groomerId))).filter(
        (id: any) => id && !fetchedGroomers.find((g: any) => Number(g.id) === Number(id))
      );

      const hasNullGroomer = validApts.some((a: any) => !a.groomerId);

      const missingGroomers = missingGroomerIds.map((id) => ({
        id: Number(id),
        name: `Майстер (ID ${id})`,
        color: '#666666',
        photoUrl: 'https://ui-avatars.com/api/?name=M&background=random'
      }));

      if (hasNullGroomer) {
        missingGroomers.push({
          id: 0,
          name: 'Без майстра',
          color: '#aaaaaa',
          photoUrl: 'https://ui-avatars.com/api/?name=Б&background=random'
        });
      }

      setAppointments(validApts);
      setGroomers([...fetchedGroomers, ...missingGroomers]);
    });
  }, [currentDate]);

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
            {format(currentDate, 'd MMMM', { locale: uk })}
          </span>
          <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">expand_more</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[18px] text-gray-600">group</span>
            <span className="text-sm font-medium text-gray-700">Все</span>
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-gray-600 text-xl">tune</span>
          </button>
        </div>
      </header>

      {/* Add Button & Today Floating Area */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button 
          onClick={() => setCurrentDate(new Date())}
          className="bg-white px-5 py-3 rounded-full shadow-lg border border-gray-100 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Сегодня
        </button>
        <button 
          onClick={() => setNewAptModalData({ isOpen: true })}
          className="bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <span className="text-[#ffcc00] font-light text-3xl mb-1">+</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
        
        {/* Horizontal Week Strip (Footer in Altegio, top here for desktop) */}
        <div className="flex bg-[#2c2c2e] text-white shrink-0 overflow-x-auto no-scrollbar pb-1">
          {weekDays.map((d, i) => {
            const isActive = isSameDay(d, currentDate);
            return (
              <div 
                key={i} 
                onClick={() => setCurrentDate(d)}
                className={`flex-1 min-w-[60px] py-2 flex flex-col items-center justify-center cursor-pointer transition-colors rounded-b-xl ${isActive ? 'bg-[#ffcc00] text-gray-900 font-bold' : 'hover:bg-gray-700'}`}
              >
                <span className="text-[11px] uppercase tracking-wide opacity-80">{format(d, 'EE', { locale: uk })}</span>
                <span className="text-lg leading-tight">{format(d, 'd')}</span>
              </div>
            );
          })}
        </div>

        {/* Column Headers (Groomers) */}
        <div className="flex border-b border-gray-100 shrink-0 mt-2">
          <div className="w-16 shrink-0 flex items-center justify-center">
             <button onClick={() => setNewAptModalData({ isOpen: true })} className="text-[#ffcc00] font-light text-2xl hover:scale-110 transition-transform">+</button>
          </div>
          
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${Math.max(groomers.length, 1)}, 1fr)` }}>
            {(groomers.length > 0 ? groomers : [{ id: 1, name: '—' }]).map((g, i) => (
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
            ))}
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

          {/* Groomers Columns */}
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${Math.max(groomers.length, 1)}, 1fr)` }}>
            {(groomers.length > 0 ? groomers : [{ id: 1 }]).map((g, i, arr) => {
              const gApts = appointments.filter(a => Number(a.groomerId || 0) === Number(g.id));
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

                  {/* Hatched Break slots (Simulated) */}
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
                    const serviceName = String(servicesList?.[0]?.service?.nameUk || servicesList?.[0]?.service?.name || '');
                    const pet = apt.pet as Record<string, any>;
                    const petSize = String(pet?.size || 'm').toUpperCase();
                    
                    const d = new Date(String(apt.date));
                    const endD = new Date(d.getTime() + Number(apt.duration) * 60000);
                    const timeRange = `${format(d, 'H:mm')} - ${format(endD, 'H:mm')}`;

                    const top = getTopPosition(String(apt.date));
                    const height = getHeight(Number(apt.duration));
                    
                    const theme = STATUS_THEMES[String(apt.status)] || STATUS_THEMES.confirmed;
                    // Mock isNew for visual
                    const isNew = Math.random() > 0.8;

                    return (
                      <div
                        key={String(apt.id)}
                        draggable
                        onDragStart={e => {
                          e.dataTransfer.setData('aptId', String(apt.id));
                          e.dataTransfer.setData('offsetY', String(e.nativeEvent.offsetY));
                        }}
                        onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); }}
                        className={`absolute left-0.5 right-0.5 rounded-md flex flex-col z-10 shadow-sm cursor-move overflow-hidden border ${theme.border} hover:shadow-md transition-shadow`}
                        style={{ top: `${top}px`, height: `${Math.max(height, 40)}px` }}
                      >
                        {/* Altegio Card Header */}
                        <div className={`${theme.header} text-white px-1.5 py-0.5 flex justify-between items-center shrink-0`}>
                          <span className="text-[10px] font-medium leading-none">{timeRange}</span>
                          <span className="material-symbols-outlined text-[12px]">{getStatusIcon(String(apt.status))}</span>
                        </div>
                        
                        {/* Altegio Card Body */}
                        <div className={`${theme.bg} flex-1 p-1.5 flex flex-col gap-0.5 overflow-hidden text-gray-800`}>
                          <div className="leading-tight text-[11px]">
                            {client ? (
                              <span className="font-semibold">{client.firstName} {client.lastName}</span>
                            ) : '—'}
                            {client?.phone && (
                              <div className="opacity-80 text-[10px]">{client.phone}</div>
                            )}
                          </div>
                          
                          {serviceName && (
                            <div className="text-[10px] leading-tight flex gap-1 items-start mt-auto pt-1">
                              {isNew && <span className="bg-[#2c5b7c] text-white text-[8px] font-bold px-1 rounded-sm uppercase tracking-wider">New</span>}
                              <span className="line-clamp-2">{petSize} - {serviceName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
