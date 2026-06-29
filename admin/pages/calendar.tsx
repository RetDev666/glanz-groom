import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

const HOURS = Array.from({ length: 9 }, (_, i) => `${i + 10}:00`);
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 border-amber-300 text-amber-900',
  confirmed: 'bg-blue-100 border-blue-300 text-blue-900',
  completed: 'bg-green-100 border-green-300 text-green-900',
  cancelled: 'bg-red-100 border-red-300 text-red-900',
};

type Appointment = Record<string, unknown>;

const toLocalDateString = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function AppointmentDetailModal({
  apt, groomers, onClose, onSave, onDelete, t, userRole
}: {
  apt: Appointment;
  groomers: Record<string, unknown>[];
  onClose: () => void;
  onSave: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  t: ReturnType<typeof useAdminLang>['t'];
  userRole: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(String(apt.status || 'pending'));
  const [groomerId, setGroomerId] = useState(String(apt.groomerId || ''));
  const [date, setDate] = useState(new Date(String(apt.date)).toISOString().slice(0, 16));
  const [notes, setNotes] = useState(String((apt.client as any)?.notes || apt.notes || ''));
  const [totalPrice, setTotalPrice] = useState(String(apt.totalPrice || ''));
  const [duration, setDuration] = useState(String(apt.duration || ''));
  
  const initialServices = Array.isArray(apt.services) ? apt.services.map((s: any) => Number(s.serviceId)) : [];
  const [serviceIds, setServiceIds] = useState<number[]>(initialServices);
  
  const [loading, setLoading] = useState(false);
  const [allServices, setAllServices] = useState<any[]>([]);

  const client = apt.client as Record<string, unknown>;
  const pet = apt.pet as Record<string, unknown>;
  const groomer = apt.groomer as Record<string, unknown>;
  const currentServices = apt.services as { service: Record<string, unknown>; price: number; serviceId: number }[];

  useEffect(() => {
    if (isEditing && allServices.length === 0) {
      const token = localStorage.getItem('admin_token');
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/services/all`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setAllServices(Array.isArray(d) ? d.filter((s:any) => s.isActive) : []));
    }
  }, [isEditing]);

  const toggleService = (id: number) => {
    setServiceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave(Number(apt.id), {
      status,
      groomerId: Number(groomerId),
      date: new Date(date).toISOString(),
      notes,
      totalPrice: Number(totalPrice),
      duration: Number(duration),
      serviceIds,
    });
    setLoading(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(t.appointments.deleteConfirm)) {
      setLoading(true);
      await onDelete(Number(apt.id));
      setLoading(false);
      onClose();
    }
  };

  const handleCancel = () => {
    if (confirm('Möchten Sie diesen Termin wirklich stornieren?')) {
      onSave(Number(apt.id), { status: 'cancelled' });
      onClose();
    }
  };

  const downloadICS = () => {
    const startDate = new Date(String(apt.date));
    const endDate = new Date(startDate.getTime() + (Number(apt.duration) * 60000));
    
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtStart = fmt(startDate);
    const dtEnd = fmt(endDate);
    
    const cName = `${client?.firstName || ''} ${client?.lastName || ''}`;
    const pName = `${pet?.name || ''} ${pet?.breed ? `(${pet.breed})` : ''}`;
    const desc = `Kunde: ${cName}\\nTelefon: ${client?.phone || ''}\\nNotizen: ${(notes || '').replace(/\\n/g, '\\n')}`;
    
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//GlanzGroom//CRM//EN\r\nBEGIN:VEVENT\r\nUID:${apt.id}-${Date.now()}@glanzgroom.de\r\nDTSTAMP:${fmt(new Date())}\r\nDTSTART:${dtStart}\r\nDTEND:${dtEnd}\r\nSUMMARY:Grooming: ${pName}\r\nDESCRIPTION:${desc}\r\nEND:VEVENT\r\nEND:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grooming-${apt.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <div>
            <h3 className="font-display text-headline-sm text-on-surface">{t.calendar.detailTitle}</h3>
            {!isEditing && (
              <p className="font-sans text-label-sm text-on-surface-variant mt-0.5">
                {new Date(String(apt.date)).toLocaleString('de-DE', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadICS} className="p-2 flex items-center gap-1 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors" title={t.addToCalendar}>
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            </button>
            {userRole !== 'groomer' && !isEditing ? (
              <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            ) : isEditing ? (
              <button onClick={handleSave} disabled={loading} className="p-2 rounded-full hover:bg-surface-container text-green-600 transition-colors">
                {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
              </button>
            ) : null}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Preis (€)</label>
                  <input type="number" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Dauer (Min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-2">{t.appointments.servicesLabel}</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-surface p-2 rounded-xl border border-outline">
                  {allServices.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-container rounded">
                      <input type="checkbox" checked={serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="w-4 h-4 rounded text-primary border-outline-variant" />
                      <span className="text-sm font-sans">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Kommentar / Notizen (für die Kundenkarte)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none" rows={3} placeholder="Fügen Sie Notizen über den Kunden oder das Tier hinzu..."></textarea>
              </div>
              <div className="pt-2 border-t border-outline-variant mt-4">
                <button type="button" onClick={handleDelete} className="w-full py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  {t.appointments.deleteTitle}
                </button>
              </div>
            </div>
          )}

          {!isEditing && Boolean(apt.petPhotoUrl) && (
            <div className="rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-high flex justify-center items-center">
              <img
                src={String(apt.petPhotoUrl)}
                alt=""
                className="w-full max-h-72 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">{t.calendar.clientAndPet}</p>
            <p className="font-sans text-label-lg text-on-surface">{String(client?.firstName || '')} {String(client?.lastName || '')} — {String(client?.phone || '')}</p>
            <p className="font-sans text-label-md text-on-surface-variant">{String(pet?.name || '')} {Boolean(pet?.breed) && `(${String(pet?.breed)})`} - {String(pet?.size || '').toUpperCase()}</p>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">{t.calendar.details}</p>
            <p className="font-sans text-body-md text-on-surface flex justify-between">
              <span>Groomer: {String(groomer?.name || '—')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[String(apt.status)] || ''}`}>{String(apt.status)}</span>
            </p>
            <div className="space-y-1 mt-2">
              {currentServices?.map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="font-sans text-label-sm text-on-surface">{String(s.service?.name || '')}</span>
                  <span className="font-display font-bold text-primary">{s.price}€</span>
                </div>
              ))}
              {(() => {
                const sumOfServices = currentServices?.reduce((sum, s) => sum + Number(s.price || 0), 0) || 0;
                const aptTotalPrice = Number(apt.totalPrice || 0);
                if (sumOfServices > aptTotalPrice) {
                  return (
                    <div className="flex justify-between text-green-600 pt-1">
                      <span className="font-sans text-label-sm font-semibold">Rabatt / Знижка</span>
                      <span className="font-display font-bold">-{sumOfServices - aptTotalPrice}€</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="border-t border-outline-variant pt-2 flex justify-between mt-2">
              <span className="font-sans text-label-md text-on-surface-variant">{String(apt.duration)} min</span>
              <span className="font-display font-bold text-primary">{String(apt.totalPrice)}€</span>
            </div>
          </div>

          {!isEditing && Boolean(notes) && (
            <div className="bg-surface-container-low rounded-2xl p-4 space-y-2 border border-outline-variant">
              <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Kommentar</p>
              <p className="font-sans text-body-md text-on-surface whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          {!isEditing && userRole !== 'groomer' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setIsEditing(true)} className="py-2.5 bg-surface-container border border-outline rounded-xl font-medium text-on-surface hover:bg-surface-container-high transition-colors flex justify-center items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                Verschieben
              </button>
              {apt.status !== 'cancelled' && (
                <button onClick={handleCancel} className="py-2.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Stornieren
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewAppointmentModal({
  groomers, onClose, onSave, t
}: {
  groomers: Record<string, unknown>[];
  onClose: () => void;
  onSave: () => void;
  t: ReturnType<typeof useAdminLang>['t'];
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    groomerId: String(groomers[0]?.id || ''),
    clientFirstName: '',
    clientLastName: '',
    clientPhone: '',
    clientEmail: '',
    petName: '',
    petBreed: '',
    petSize: 'm',
    notes: '',
    serviceIds: [] as number[],
  });
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch(`${API}/services/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d) ? d.filter((s:any) => s.isActive) : []));
      
    fetch(`${API}/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setClients(Array.isArray(d) ? d : []));
  }, []);

  const toggleService = (id: number) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id) 
        ? prev.serviceIds.filter(x => x !== id) 
        : [...prev.serviceIds, id]
    }));
  };

  const handleClientSelect = (client: any) => {
    const pet = client.pets && client.pets.length > 0 ? client.pets[0] : null;
    setForm(prev => ({
      ...prev,
      clientFirstName: client.firstName || '',
      clientLastName: client.lastName || '',
      clientPhone: client.phone || '',
      clientEmail: client.email || '',
      petName: pet?.name || '',
      petBreed: pet?.breed || '',
      petSize: pet?.size || 'm'
    }));
    setShowSuggestions(false);
  };

  const filteredClients = form.clientFirstName.length > 1 && showSuggestions
    ? clients.filter(c => 
        (c.firstName || '').toLowerCase().includes(form.clientFirstName.toLowerCase()) || 
        (c.lastName || '').toLowerCase().includes(form.clientFirstName.toLowerCase()) ||
        (c.phone || '').includes(form.clientFirstName)
      ).slice(0, 5)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientPhone || !form.petName || !form.date || form.serviceIds.length === 0) {
      return alert('Bitte füllen Sie alle Pflichtfelder aus (Telefon, Name des Tieres, Leistungen)');
    }
    
    setLoading(true);
    const payload = {
      ...form,
      clientEmail: form.clientEmail || `${Date.now()}@no-email.local`,
      date: new Date(form.date).toISOString(),
      groomerId: Number(form.groomerId) || Number(groomers[0]?.id) || 0,
    };

    const res = await fetch(`${API}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="font-display text-headline-sm text-on-surface">{t.sidebar.newAppointment}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Vorname des Kunden</label>
              <input 
                type="text" 
                value={form.clientFirstName} 
                onChange={e => {
                  setForm({...form, clientFirstName: e.target.value});
                  setShowSuggestions(true);
                }} 
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none focus:border-primary" 
                placeholder="Vorname suchen..." 
              />
              {filteredClients.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredClients.map(c => (
                    <li 
                      key={c.id} 
                      onClick={() => handleClientSelect(c)}
                      className="px-4 py-2 hover:bg-surface-container cursor-pointer border-b border-outline-variant last:border-0"
                    >
                      <div className="font-sans text-sm text-on-surface font-medium">{c.firstName} {c.lastName}</div>
                      <div className="font-sans text-xs text-on-surface-variant">{c.phone}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Nachname</label>
              <input type="text" value={form.clientLastName} onChange={e => setForm({...form, clientLastName: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Nachname" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Telefon *</label>
              <input type="text" required value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Telefon" />
            </div>
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">E-Mail</label>
              <input type="email" value={form.clientEmail} onChange={e => setForm({...form, clientEmail: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="E-Mail" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Name des Tieres *</label>
              <input type="text" required value={form.petName} onChange={e => setForm({...form, petName: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Name" />
            </div>
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Rasse</label>
              <input type="text" value={form.petBreed} onChange={e => setForm({...form, petBreed: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none" placeholder="Rasse eingeben" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Größe</label>
              <select value={form.petSize} onChange={e => setForm({...form, petSize: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 outline-none">
                <option value="xs">XS</option><option value="s">S</option><option value="m">M</option><option value="l">L</option><option value="xl">XL</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-sans text-label-sm text-on-surface-variant mb-2">{t.appointments.servicesLabel} *</label>
            <div className="max-h-40 overflow-y-auto space-y-1 bg-surface-container-low p-2 rounded-xl border border-outline-variant">
              {services.map(s => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-container rounded">
                  <input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="w-4 h-4 rounded text-primary border-outline-variant" />
                  <span className="text-sm font-sans">{s.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Kommentar / Notizen (für die Kundenkarte)</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-3 py-2 text-sm outline-none" rows={2} placeholder="Fügen Sie Notizen über den Kunden oder das Tier hinzu..."></textarea>
          </div>
          <div className="pt-4 flex gap-3 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-full border border-outline hover:bg-surface-container transition-colors">{t.cancel}</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity font-medium">
              {loading ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BlockTimeModal({
  groomers, currentDate, onClose, onSave, t
}: {
  groomers: Record<string, unknown>[];
  currentDate: Date;
  onClose: () => void;
  onSave: () => void;
  t: ReturnType<typeof useAdminLang>['t'];
}) {
  const [form, setForm] = useState({
    groomerId: String(groomers[0]?.id || ''),
    startTime: '10:00',
    endTime: '18:00',
    notes: 'Blockiert'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const [sh, sm] = form.startTime.split(':').map(Number);
    const [eh, em] = form.endTime.split(':').map(Number);
    
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const duration = endMins - startMins;

    if (duration <= 0) {
      alert('Ungültige Zeitspanne');
      setLoading(false);
      return;
    }

    const dateStr = toLocalDateString(currentDate);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/appointments/admin-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      body: JSON.stringify({
        clientFirstName: 'System',
        clientPhone: '000000000',
        petName: form.notes,
        petSize: 'm',
        serviceIds: [],
        groomerId: Number(form.groomerId),
        date: `${dateStr}T${form.startTime}:00`,
        duration,
        totalPrice: 0,
        notes: form.notes
      })
    });

    if (res.ok) {
      onSave();
      onClose();
    } else {
      alert('Fehler beim Blockieren');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-outline-variant" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="font-display text-headline-sm text-on-surface">Zeit blockieren</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-label-sm text-on-surface-variant">Groomer</label>
            <select value={form.groomerId} onChange={e => setForm({...form, groomerId: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
              {groomers.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-label-sm text-on-surface-variant">Von</label>
              <input type="time" required value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-label-sm text-on-surface-variant">Bis</label>
              <input type="time" required value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-label-sm text-on-surface-variant">Notiz (optional)</label>
            <input type="text" placeholder="Blockiert" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-surface-container rounded-xl font-sans hover:bg-surface-container-high transition-colors text-on-surface">Abbrechen</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-sans font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Blockiere...' : 'Blockieren'}
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
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qDate = params.get('date');
      if (qDate) return new Date(qDate);
    }
    return new Date();
  });
  const [view, setView] = useState<'week' | 'day'>('day');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showNewApt, setShowNewApt] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  const fetchAppointments = () => {
    setCurrentDate(new Date(currentDate));
  };
  
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay() || 7; 
    d.setDate(d.getDate() - day + 1);
    return d;
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    let queryDate = '';
    if (view === 'day') {
      queryDate = `date=${toLocalDateString(currentDate)}`;
    } else {
      const start = getWeekStart(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      queryDate = `startDate=${toLocalDateString(start)}&endDate=${toLocalDateString(end)}`;
    }

    const fetchData = () => {
      Promise.all([
        fetch(`${API}/appointments?${queryDate}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
        fetch(`${API}/groomers/all`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
      ]).then(([apts, grs]) => {
        setAppointments(Array.isArray(apts) ? apts : []);
        setGroomers(Array.isArray(grs) ? grs : []);
      });
    };

    fetchData();

    window.addEventListener('new-appointment', fetchData);
    return () => window.removeEventListener('new-appointment', fetchData);
  }, [currentDate, view]);

  const handleUpdateAppointment = async (id: number, data: any) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    setCurrentDate(new Date(currentDate));
  };

  const handleDeleteAppointment = async (id: number) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/appointments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setCurrentDate(new Date(currentDate));
  };

  const handleDrop = async (e: React.DragEvent, newGroomerId: number) => {
    e.preventDefault();
    if (userRole === 'groomer') return;
    const aptId = e.dataTransfer.getData('aptId');
    if (!aptId) return;

    const offsetY = Number(e.dataTransfer.getData('offsetY') || 0);
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top - offsetY;

    const totalHours = (y / 80) + 10;
    let hours = Math.floor(Math.max(10, totalHours));
    let minutes = Math.round((Math.max(10, totalHours) - hours) * 60);

    minutes = Math.round(minutes / 15) * 15;
    if (minutes === 60) { hours += 1; minutes = 0; }

    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);

    await handleUpdateAppointment(Number(aptId), {
      groomerId: newGroomerId,
      date: newDate.toISOString()
    });
  };

  const prevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); };
  const nextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); };

  const getTopPosition = (date: string) => {
    const d = new Date(date);
    return ((d.getHours() - 10) + d.getMinutes() / 60) * 80;
  };

  const handleBlockDay = () => {
    setShowBlockModal(true);
  };

  const getHeight = (duration: number) => (duration / 60) * 80;
  const getGroomerApts = (groomerId: number) => appointments.filter(a => a.groomerId === groomerId);

  const handleResizeStart = (e: React.MouseEvent, aptId: number, currentDuration: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (userRole === 'groomer') return;

    const startY = e.clientY;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMinutes = (deltaY / 80) * 60;
      let newDuration = Math.round((currentDuration + deltaMinutes) / 15) * 15;
      if (newDuration < 15) newDuration = 15;

      setAppointments(prev => prev.map(a => 
        a.id === aptId ? { ...a, duration: newDuration } : a
      ));
    };

    const handleMouseUp = async (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      const deltaY = upEvent.clientY - startY;
      const deltaMinutes = (deltaY / 80) * 60;
      let newDuration = Math.round((currentDuration + deltaMinutes) / 15) * 15;
      if (newDuration < 15) newDuration = 15;

      setAppointments(prev => prev.map(a => 
        a.id === aptId ? { ...a, duration: newDuration } : a
      ));
      
      await handleUpdateAppointment(aptId, { duration: newDuration });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <AdminLayout title={t.calendar.title}>
      {selectedApt && <AppointmentDetailModal apt={selectedApt} groomers={groomers} t={t} userRole={userRole} onClose={() => setSelectedApt(null)} onSave={handleUpdateAppointment} onDelete={handleDeleteAppointment} />}
      {showNewApt && <NewAppointmentModal groomers={groomers} t={t} onClose={() => setShowNewApt(false)} onSave={() => setCurrentDate(new Date(currentDate))} />}
      {showBlockModal && <BlockTimeModal groomers={groomers} currentDate={currentDate} t={t} onClose={() => setShowBlockModal(false)} onSave={() => setCurrentDate(new Date(currentDate))} />}

      <header className="sticky top-0 bg-surface border-b border-outline-variant flex justify-between items-center px-6 h-16 shrink-0 z-40">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-xl font-bold text-on-surface">{t.calendar.title}</h2>
          <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-2 py-1">
            <button onClick={prevDay} className="p-1.5 rounded-full hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="relative flex items-center">
              <input
                type="date"
                value={toLocalDateString(currentDate)}
                onChange={(e) => {
                  if (e.target.value) setCurrentDate(new Date(e.target.value));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="font-sans text-label-lg px-2 hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                {currentDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </span>
            </div>
            <button onClick={nextDay} className="p-1.5 rounded-full hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userRole !== 'groomer' && (
            <>
              <button
                onClick={() => setShowNewApt(true)}
                className="bg-primary text-on-primary font-sans text-label-lg px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                {t.sidebar.newAppointment}
              </button>
              <button
                onClick={handleBlockDay}
                className="bg-surface-container text-on-surface font-sans text-label-lg px-4 py-1.5 rounded-full hover:bg-surface-container-high border border-outline-variant transition-opacity flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">block</span>
                Zeit blockieren
              </button>
            </>
          )}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="border border-outline font-sans text-label-lg px-4 py-1.5 rounded-full hover:bg-surface-container-low transition-colors"
          >
            {t.calendar.today}
          </button>
          <div className="flex bg-surface-container-low rounded-full p-1">
            {(['day', 'week'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`font-sans text-label-lg px-4 py-1 rounded-full transition-colors ${view === v ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {v === 'day' ? t.calendar.day : t.calendar.week}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          {/* Column Headers */}
          <div className="flex border-b border-outline-variant bg-surface-container-low shrink-0">
            <div className="w-20 border-r border-outline-variant shrink-0" />
            
            {view === 'day' ? (
              <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(${Math.max(groomers.length, 1)}, 1fr)` }}>
                {(groomers.length > 0 ? groomers : [{ id: 1, name: '—', role: '—', color: '#ccc' }]).map((g, i, arr) => (
                  <div key={String(g.id)} className={`p-3 text-center ${i < arr.length - 1 ? 'border-r border-outline-variant' : ''} flex flex-col items-center gap-1`}>
                    {g.photoUrl ? (
                      <img src={String(g.photoUrl)} alt={String(g.name)} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white" style={{ backgroundColor: String(g.color) }}>
                        {String(g.name).charAt(0)}
                      </div>
                    )}
                    <span className="font-sans text-label-lg text-on-surface">{String(g.name)}</span>
                    <span className="font-sans text-label-sm text-on-surface-variant">{String(g.role)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(getWeekStart(currentDate));
                  d.setDate(d.getDate() + i);
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`p-3 text-center ${i < 6 ? 'border-r border-outline-variant' : ''} flex flex-col items-center gap-1`}>
                      <span className="font-sans text-label-lg text-on-surface">
                        {d.toLocaleDateString('de-DE', { weekday: 'short' })}
                      </span>
                      <span className={`text-sm ${isToday ? 'bg-primary text-on-primary w-6 h-6 flex items-center justify-center rounded-full' : 'text-on-surface'}`}>
                        {d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-1 flex overflow-y-auto">
            <div className="w-20 border-r border-outline-variant shrink-0 bg-surface flex flex-col">
              {HOURS.map(h => (
                <div key={h} className="h-20 border-b border-outline-variant flex items-start justify-end pr-2 pt-2">
                  <span className="font-sans text-label-sm text-on-surface-variant -mt-3">{h}</span>
                </div>
              ))}
            </div>

            {view === 'day' ? (
              <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(${Math.max(groomers.length, 1)}, 1fr)` }}>
                {(groomers.length > 0 ? groomers : [{ id: 1 }]).map((g, i, arr) => {
                  const gApts = getGroomerApts(Number(g.id));
                  return (
                    <div
                      key={String(g.id)}
                      className={`relative ${i < arr.length - 1 ? 'border-r border-outline-variant' : ''}`}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleDrop(e, Number(g.id))}
                    >
                      {HOURS.map(h => <div key={h} className="h-20 border-b border-outline-variant" />)}

                      {gApts.map(apt => {
                        const client = apt.client as Record<string, unknown>;
                        const pet = apt.pet as Record<string, unknown>;
                        const top = getTopPosition(String(apt.date));
                        const height = getHeight(Number(apt.duration));
                        const color = STATUS_COLORS[String(apt.status)] || 'bg-primary-fixed border-primary';

                        return (
                          <div
                            key={String(apt.id)}
                            draggable
                            onDragStart={e => {
                              e.dataTransfer.setData('aptId', String(apt.id));
                              e.dataTransfer.setData('offsetY', String(e.nativeEvent.offsetY));
                            }}
                            onClick={() => setSelectedApt(apt)}
                            className={`absolute left-1 right-1 ${color} rounded-lg border-2 p-2 flex flex-col gap-1 z-10 shadow-sm hover:shadow-md transition-shadow cursor-move overflow-hidden opacity-90 hover:opacity-100`}
                            style={{ top: `${top}px`, height: `${Math.max(height, 60)}px` }}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-sans text-label-lg font-semibold truncate">
                                {pet ? String(pet.name) : '—'}
                              </span>
                              <span className="font-sans text-label-sm bg-white/60 px-1.5 py-0.5 rounded-full shrink-0 text-[10px]">
                                {(() => {
                                  const s = new Date(String(apt.date));
                                  const e = new Date(s.getTime() + Number(apt.duration) * 60000);
                                  return `${s.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
                                })()}
                              </span>
                            </div>
                            <span className="font-sans text-label-sm truncate">
                              {client ? `${client.firstName} ${client.lastName}` : ''}
                            </span>
                            <div 
                              className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-end justify-center group"
                              onMouseDown={(e) => handleResizeStart(e, Number(apt.id), Number(apt.duration))}
                            >
                              <div className="w-8 h-1 bg-black/20 rounded-full mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
</div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(getWeekStart(currentDate));
                  d.setDate(d.getDate() + i);
                  const dateStr = toLocalDateString(d);
                  // In week view, we get all appointments for this day
                  const dayApts = appointments.filter(a => String(a.date).startsWith(dateStr));
                  
                  return (
                    <div key={i} className={`relative ${i < 6 ? 'border-r border-outline-variant' : ''}`}>
                      {HOURS.map(h => <div key={h} className="h-20 border-b border-outline-variant" />)}
                      {dayApts.map(apt => {
                        const groomer = apt.groomer as Record<string, unknown>;
                        const pet = apt.pet as Record<string, unknown>;
                        const top = getTopPosition(String(apt.date));
                        const height = getHeight(Number(apt.duration));
                        const color = STATUS_COLORS[String(apt.status)] || 'bg-primary-fixed border-primary';

                        return (
                          <div
                            key={String(apt.id)}
                            onClick={() => setSelectedApt(apt)}
                            className={`absolute left-1 right-1 ${color} rounded-lg border-2 p-1.5 flex flex-col gap-0.5 z-10 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden opacity-90 hover:opacity-100`}
                            style={{ top: `${top}px`, height: `${Math.max(height, 50)}px` }}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-sans text-label-sm font-semibold truncate text-[11px]">
                                {(() => {
                                  const s = new Date(String(apt.date));
                                  const e = new Date(s.getTime() + Number(apt.duration) * 60000);
                                  return `${s.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
                                })()}
                              </span>
                            </div>
                            <span className="font-sans text-label-md truncate font-bold">
                              {pet ? String(pet.name) : '—'}
                            </span>
                            <span className="font-sans text-label-sm truncate text-[11px] opacity-80">
                              {groomer ? String(groomer.name) : '—'}
                            </span>
                            <div 
                              className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-end justify-center group"
                              onMouseDown={(e) => handleResizeStart(e, Number(apt.id), Number(apt.duration))}
                            >
                              <div className="w-6 h-1 bg-black/20 rounded-full mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
</div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
