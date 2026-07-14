import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('de', de);

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
  apt, groomers, onClose, onSave, onEditFull, t
}: {
  apt: Appointment;
  groomers: Record<string, unknown>[];
  onClose: () => void;
  onSave: (id: number, data: any) => Promise<void>;
  onEditFull?: (apt: Appointment) => void;
  t: ReturnType<typeof useAdminLang>['t'];
}) {
  const client = apt.client as Record<string, any>;
  const pet = apt.pet as Record<string, any>;
  const groomer = apt.groomer as Record<string, any>;
  const services = apt.services as { service: Record<string, any>; price: number }[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div>
            <h3 className="font-display text-headline-sm text-on-surface">{t.calendar.detailTitle}</h3>
          </div>
          <div className="flex items-center gap-2">
            {onEditFull && (
              <button onClick={() => onEditFull(apt)} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

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
                  <span className="font-sans text-label-sm text-on-surface">{String(s.service?.nameDe || s.service?.name || '')}</span>
                  <span className={`font-display font-bold ${((sum > 0 && apt.totalPrice !== undefined) && (sum - Number(apt.totalPrice)) > 0) ? 'text-on-surface-variant line-through' : 'text-primary'}`}>{s.price}€</span>
                </div>
              ))}
              
              {((sum > 0 && apt.totalPrice !== undefined) && (sum - Number(apt.totalPrice)) > 0) && (
                <>
                  <div className="flex justify-between pt-2 mt-2 border-t border-outline-variant">
                    <span className="font-sans text-label-sm text-on-surface-variant">Rabatt</span>
                    <span className="font-display font-bold text-red-500">-{Math.max(0, sum - Number(apt.totalPrice))}€</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-sans text-label-sm font-bold text-on-surface">Gesamtbetrag</span>
                    <span className="font-display font-bold text-primary">{Number(apt.totalPrice)}€</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomSelect({ value, onChange, options, placeholder = 'Wählen...' }: { value: any, onChange: (v: any) => void, options: { label: string, value: any }[], placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(o => String(o.value) === String(value));
  
  return (
    <div className="relative">
      <div 
        className="w-full bg-surface border border-outline rounded-xl px-3 py-2 cursor-pointer flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span className={`font-sans text-sm ${selectedOption ? 'text-on-surface' : 'text-on-surface-variant'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>expand_more</span>
      </div>
      
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-outline rounded-xl shadow-lg z-[70] overflow-hidden max-h-60 overflow-y-auto py-1">
            {options.map((o, i) => (
              <div 
                key={i}
                className={`px-3 py-2 cursor-pointer hover:bg-surface-container transition-colors text-sm ${String(value) === String(o.value) ? 'bg-primary/5 text-primary font-medium' : 'text-on-surface'}`}
                onClick={() => { onChange(o.value); setOpen(false); }}
              >
                {o.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function NewAppointmentModal({
  groomers, initialDate, initialGroomerId, editingApt, onClose, onSave, t
}: {
  groomers: Record<string, unknown>[];
  initialDate?: Date;
  initialGroomerId?: number;
  editingApt?: any;
  onClose: () => void;
  onSave: () => void;
  t: ReturnType<typeof useAdminLang>['t'];
}) {
  const defaultDate = editingApt?.date ? new Date(new Date(editingApt.date).getTime() - new Date(editingApt.date).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : (initialDate ? new Date(initialDate.getTime() - initialDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  
  let initialDiscount = 0;
  if (editingApt && editingApt.services && editingApt.totalPrice !== undefined) {
    const sum = editingApt.services.reduce((acc: number, s: any) => acc + (s.price || 0), 0);
    initialDiscount = Math.max(0, sum - editingApt.totalPrice);
  }

  const [form, setForm] = useState({
    date: defaultDate,
    groomerId: String(editingApt?.groomerId || initialGroomerId || groomers[0]?.id || ''),
    clientFirstName: editingApt?.client?.firstName || '',
    clientLastName: editingApt?.client?.lastName || '',
    clientPhone: editingApt?.client?.phone || '',
    clientEmail: editingApt?.client?.email || '',
    petName: editingApt?.pet?.name || '',
    petBreed: editingApt?.pet?.breed || '',
    petSize: editingApt?.pet?.size || 'm',
    notes: editingApt?.notes || '',
    serviceIds: editingApt?.services?.map((s:any) => s.serviceId) || ([] as number[]),
    discount: initialDiscount,
    isBlock: editingApt?.status === 'blocked',
    duration: editingApt?.duration || 60,
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
        ? prev.serviceIds.filter((x: number) => x !== id) 
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
    // When editing, always send serviceIds to trigger recalculation with discount
    const serviceIdsToSend = editingApt && form.serviceIds.length === 0
      ? editingApt.services?.map((s: any) => s.serviceId) || []
      : form.serviceIds;
    const payload = {
      ...form,
      serviceIds: serviceIdsToSend,
      petBreed: form.petBreed,
      clientEmail: form.clientEmail || `${Date.now()}@no-email.local`,
      date: new Date(form.date).toISOString(),
      groomerId: Number(form.groomerId) || Number(groomers[0]?.id) || 0,
    };

    const token = localStorage.getItem('admin_token');
    
    let res;
    if (editingApt) {
      res = await fetch(`${API}/appointments/${editingApt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`${API}/appointments/admin-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
    }

    setLoading(false);
    
    if (res.ok) {
      onSave();
      onClose();
    } else {
      const data = await res.json();
      alert(data.error || 'Fehler beim Speichern');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="font-display text-headline-sm text-on-surface">{editingApt ? 'Termin bearbeiten' : 'Neuer Termin'}</h3>
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
              <CustomSelect 
                value={form.groomerId} 
                onChange={v => setForm({...form, groomerId: v})} 
                options={groomers.map((g: any) => ({ label: g.name, value: g.id }))} 
              />
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
                  <CustomSelect 
                    value={form.petSize} 
                    onChange={v => setForm({...form, petSize: v})} 
                    options={[
                      {label: 'XS', value: 'xs'},
                      {label: 'S', value: 's'},
                      {label: 'M', value: 'm'},
                      {label: 'L', value: 'l'},
                      {label: 'XL', value: 'xl'}
                    ]} 
                  />
                </div>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Rasse (Breed)</label>
                <input type="text" value={form.petBreed} onChange={e => setForm({...form, petBreed: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="z.B. Golden Retriever" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-2">Rabatt (€)</label>
                  <input type="number" min="0" step="0.01" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="0.00" />
                  
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1 mt-4">Grund (Kommentar)</label>
                  <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Notizen..." />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Dauer (Minuten) *</label>
                <CustomSelect 
                  value={form.duration} 
                  onChange={v => setForm({...form, duration: Number(v)})} 
                  options={[
                    {label: '15 Min', value: 15},
                    {label: '30 Min', value: 30},
                    {label: '1 Std', value: 60},
                    {label: '1.5 Std', value: 90},
                    {label: '2 Std', value: 120},
                    {label: 'Halber Tag (4 Std)', value: 240},
                    {label: 'Ganzer Tag (8 Std)', value: 480}
                  ]} 
                />
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
  const [filterGroomerId, setFilterGroomerId] = useState<number | null>(null);
  const [isGroomerDropdownOpen, setIsGroomerDropdownOpen] = useState(false);
  const [resizeState, setResizeState] = useState<{ aptId: string | number; startY: number; startDuration: number; currentDuration: number } | null>(null);
  
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean, x: number, y: number, apt: Appointment | null }>({ isOpen: false, x: 0, y: 0, apt: null });

  const [newAptModalData, setNewAptModalData] = useState<{isOpen: boolean, date?: Date, groomerId?: number, editingApt?: any}>({ isOpen: false });

  // Add a state to store breaks (currently simulated, as API doesn't have it yet)
  const [breaks] = useState([{ groomerId: 1, start: '13:15', end: '13:45' }]);

  useEffect(() => {
    if (!resizeState) return;
    const handleMouseMove = (e: MouseEvent) => {
      const diffY = e.clientY - resizeState.startY;
      const diffMinutes = Math.round(diffY / 2);
      const snappedDiff = Math.round(diffMinutes / 5) * 5; // Snap to 5 mins
      const newDuration = Math.max(15, resizeState.startDuration + snappedDiff);
      setResizeState(prev => prev ? { ...prev, currentDuration: newDuration } : null);
    };
    const handleMouseUp = async () => {
      if (resizeState.currentDuration !== resizeState.startDuration) {
        await handleUpdateAppointment(Number(resizeState.aptId), { duration: resizeState.currentDuration });
      }
      setResizeState(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState?.startY, resizeState?.startDuration]);

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
      {selectedApt && <AppointmentDetailModal 
        apt={selectedApt} 
        groomers={groomers} 
        t={t} 
        onClose={() => setSelectedApt(null)} 
        onSave={handleUpdateAppointment} 
        onEditFull={(apt) => {
          setSelectedApt(null);
          setNewAptModalData({ isOpen: true, editingApt: apt });
        }}
      />}
      {newAptModalData.isOpen && <NewAppointmentModal 
        groomers={groomers} 
        t={t} 
        initialDate={newAptModalData.date}
        initialGroomerId={newAptModalData.groomerId}
        editingApt={newAptModalData.editingApt}
        onClose={() => setNewAptModalData({ isOpen: false })} 
        onSave={fetchAppointments} 
      />}

      <header className="bg-primary px-4 py-2 flex items-center justify-between shrink-0">
        {/* Left: Date navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; })}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          
          <div className="px-3 group cursor-pointer relative">
            <DatePicker
              selected={currentDate}
              onChange={(date: Date | null) => date && setCurrentDate(date)}
              locale="de"
              customInput={
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg text-white group-hover:text-white/80 transition-colors">
                    {format(currentDate, 'd MMMM yyyy', { locale: de })}
                  </span>
                  <span className="material-symbols-outlined text-white/70 text-[18px] group-hover:text-white transition-colors">expand_more</span>
                </div>
              }
            />
          </div>

          <button
            onClick={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; })}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-xs font-semibold rounded-full border border-white/40 text-white hover:bg-white hover:text-primary transition-colors ml-1"
          >
            Heute
          </button>
        </div>

        {/* Center: View Mode */}
        <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              viewMode === 'day' ? 'bg-white text-primary shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Tag
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              viewMode === 'week' ? 'bg-white text-primary shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Woche
          </button>
        </div>

        {/* Right: Groomer filter + actions */}
        <div className="flex items-center gap-2">
          {/* Groomer filter */}
          <div className="relative flex items-center">
            <button 
              onClick={() => setIsGroomerDropdownOpen(!isGroomerDropdownOpen)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors text-white"
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span className="text-sm font-medium">
                {filterGroomerId ? String(groomers.find(g => Number(g.id) === filterGroomerId)?.name ?? 'Alle') : 'Alle'}
              </span>
              <span className="material-symbols-outlined text-[14px] text-white/50">expand_more</span>
            </button>
            
            {isGroomerDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsGroomerDropdownOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
                  <button
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${!filterGroomerId ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'}`}
                    onClick={() => { setFilterGroomerId(null); setIsGroomerDropdownOpen(false); }}
                  >
                    Alle
                  </button>
                  {groomers.map(g => (
                    <button
                      key={String(g.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${filterGroomerId === Number(g.id) ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'}`}
                      onClick={() => { setFilterGroomerId(Number(g.id)); setIsGroomerDropdownOpen(false); }}
                    >
                      {String(g.name)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Block day */}
          <button
            onClick={() => setNewAptModalData({ isOpen: true, date: new Date(currentDate.setHours(13, 0, 0, 0)), groomerId: Number(groomers[0]?.id) || 1 })}
            title="Tag blockieren"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-red-500/30 px-3 py-1.5 rounded-xl transition-colors text-white/80 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">event_busy</span>
            <span className="text-sm">Blockieren</span>
          </button>

          {/* New appointment */}
          <button
            onClick={() => setNewAptModalData({ isOpen: true })}
            className="flex items-center gap-1.5 bg-white text-primary px-4 py-1.5 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Neuer Termin
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
        
        {/* Horizontal Week Strip */}
        <div className="flex bg-primary/5 shrink-0 overflow-x-auto no-scrollbar border-b border-gray-100">
          {weekDays.map((d, i) => {
            const isActive = isSameDay(d, currentDate);
            const hasApts = appointments.filter(a => isSameDay(new Date(String(a.date)), d)).length;
            return (
              <div
                key={i}
                onClick={() => setCurrentDate(d)}
                className={`flex-1 min-w-[52px] py-2.5 flex flex-col items-center justify-center cursor-pointer transition-all rounded-b-lg ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-sm'
                    : 'hover:bg-primary/5 text-gray-600'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-widest ${isActive ? 'opacity-90' : 'opacity-70'}`}>{format(d, 'EE', { locale: de })}</span>
                <span className={`text-base font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{format(d, 'd')}</span>
                {hasApts > 0 && (
                  <div className={`w-1 h-1 rounded-full mt-0.5 ${isActive ? 'bg-white' : 'bg-primary'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Column Headers (Groomers or Days) */}
        <div className="flex border-b border-gray-100 shrink-0">
          <div className="w-16 shrink-0 flex items-center justify-center"></div>
          
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${viewMode === 'day' ? Math.max((filterGroomerId ? groomers.filter(g => Number(g.id) === filterGroomerId) : groomers).length, 1) : 7}, 1fr)` }}>
            {viewMode === 'day' ? (
              ((filterGroomerId ? groomers.filter(g => Number(g.id) === filterGroomerId) : groomers).length > 0 ? (filterGroomerId ? groomers.filter(g => Number(g.id) === filterGroomerId) : groomers) : [{ id: 1, name: '—' }]).map((g, i) => (
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
                <div key={h} className="h-[60px] shrink-0 relative">
                  {isFullHour && (
                    <span className="absolute top-0 right-2 -translate-y-1/2 text-[13px] text-gray-500 font-medium bg-white px-1">
                      {h}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Groomers or Days Columns */}
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${viewMode === 'day' ? Math.max((filterGroomerId ? groomers.filter(g => Number(g.id) === filterGroomerId) : groomers).length, 1) : 7}, 1fr)` }}>
            {viewMode === 'day' ? (
              ((filterGroomerId ? groomers.filter(g => Number(g.id) === filterGroomerId) : groomers).length > 0 ? (filterGroomerId ? groomers.filter(g => Number(g.id) === filterGroomerId) : groomers) : [{ id: 1 }]).map((g, i, arr) => {
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
                        <div key={h} className={`h-[60px] shrink-0 border-b ${isFullHour ? 'border-gray-200' : 'border-gray-100/50'}`} style={{ pointerEvents: 'none' }} />
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
                      const isResizing = resizeState?.aptId === String(apt.id);
                      const durationToUse = isResizing ? resizeState.currentDuration : Number(apt.duration);
                      const endD = new Date(d.getTime() + durationToUse * 60000);
                      const timeRange = `${format(d, 'H:mm')} - ${format(endD, 'H:mm')}`;

                      const top = getTopPosition(String(apt.date));
                      const height = Math.max(getHeight(durationToUse), 40);
                      
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
                              <div className="text-[10px] leading-tight flex gap-1 items-start mt-auto pt-1 mb-1">
                                <span className="line-clamp-2">{petSize} - {serviceName}</span>
                              </div>
                            )}
                          </div>
                          {/* Resize Handle */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10 transition-colors z-20 group flex items-end justify-center pb-[2px]"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setResizeState({ aptId: String(apt.id), startY: e.clientY, startDuration: Number(apt.duration), currentDuration: Number(apt.duration) });
                            }}
                          >
                            <div className="w-8 h-1 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
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
                        <div key={h} className={`h-[60px] shrink-0 border-b ${isFullHour ? 'border-gray-200' : 'border-gray-100/50'}`} style={{ pointerEvents: 'none' }} />
                      );
                    })}

                    {/* Appointments */}
                    {dayApts.map(apt => {
                      const client = apt.client as Record<string, any>;
                      const groomer = apt.groomer as Record<string, any>;
                      
                      const dStart = new Date(String(apt.date));
                      const isResizing = resizeState?.aptId === String(apt.id);
                      const durationToUse = isResizing ? resizeState.currentDuration : Number(apt.duration);
                      const endD = new Date(dStart.getTime() + durationToUse * 60000);
                      const timeRange = `${format(dStart, 'H:mm')} - ${format(endD, 'H:mm')}`;

                      const top = getTopPosition(String(apt.date));
                      const height = Math.max(getHeight(durationToUse), 40);
                      
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
                            <span className="text-[10px] font-bold uppercase truncate max-w-[50px]">{String(groomer?.name || 'O.G.')}</span>
                          </div>
                          
                          <div className={`${theme.bg} flex-1 p-1 flex flex-col gap-0.5 overflow-hidden text-gray-800 mb-1`}>
                            <div className="leading-tight text-[10px] font-semibold truncate">
                              {client ? `${String(client.firstName)} ${String(client.lastName)}` : '—'}
                            </div>
                          </div>
                          {/* Resize Handle */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10 transition-colors z-20 group flex items-end justify-center pb-[2px]"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setResizeState({ aptId: String(apt.id), startY: e.clientY, startDuration: Number(apt.duration), currentDuration: Number(apt.duration) });
                            }}
                          >
                            <div className="w-8 h-1 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
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
              className="px-4 py-2 text-sm text-left hover:bg-green-50 flex items-center gap-2 text-green-700 transition-colors"
              onClick={() => {
                const client = contextMenu.apt!.client as Record<string, unknown>;
                const phone = String(client?.phone || '').replace(/\D/g, '');
                const petName = String((contextMenu.apt!.pet as Record<string, unknown>)?.name || '');
                const date = new Date(String(contextMenu.apt!.date)).toLocaleDateString('de-DE');
                const msg = encodeURIComponent(`Hallo! Wir möchten Sie an Ihren Termin am ${date} für ${petName} erinnern.`);
                window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                setContextMenu({ ...contextMenu, isOpen: false });
              }}
            >
              <svg className="w-[18px] h-[18px] fill-green-700" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Auf WhatsApp schreiben
            </button>

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
