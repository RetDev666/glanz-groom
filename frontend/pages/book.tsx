import Head from 'next/head';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useTranslation } from '@/hooks/useTranslation';

// ─── Mini Calendar Component ──────────────────────────────
const DE_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DE_MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

function MiniCalendar({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const [viewYear, setViewYear] = useState(value ? new Date(value).getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? new Date(value).getMonth() : today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build days grid (Mon-based)
  const firstDay = new Date(viewYear, viewMonth, 1);
  // Monday=0 offset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_left</span>
        </button>
        <span className="font-display font-bold text-on-surface">
          {DE_MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_right</span>
        </button>
      </div>
      {/* Day labels */}
      <div className="grid grid-cols-7 text-center border-b border-outline-variant">
        {DE_DAYS.map(d => (
          <div key={d} className="py-2 font-sans text-label-sm text-on-surface-variant font-semibold">{d}</div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0,0,0,0);
          const isPast = date < today;
          const isSunday = date.getDay() === 0;
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
          const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          return (
            <button
              key={day}
              disabled={isPast || isSunday}
              onClick={() => onChange(dateStr)}
              className={`aspect-square w-full flex items-center justify-center rounded-xl text-sm font-sans transition-all ${
                isSelected
                  ? 'bg-primary text-on-primary font-bold shadow-sm scale-105'
                  : isToday
                  ? 'border-2 border-primary text-primary font-bold'
                  : isPast || isSunday
                  ? 'text-on-surface-variant/30 cursor-not-allowed bg-surface-container-lowest'
                  : 'hover:bg-primary/10 text-on-surface'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <div className="px-4 py-3 bg-primary/5 border-t border-outline-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">event</span>
          <span className="font-sans text-label-md text-primary font-semibold">
            {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────
interface Service { 
  id: number; 
  name: string; 
  nameUk: string; 
  nameEn?: string;
  description: string; 
  priceXs: number; priceS: number; priceM: number; priceL: number; priceXl: number; 
  durationXs: number; durationS: number; durationM: number; durationL: number; durationXl: number;
  category: string; 
}
interface Groomer { id: number; name: string; role: string; color: string; photoUrl?: string | null; }
interface PetBooking {
  id: string;
  petSize: 'xs' | 's' | 'm' | 'l' | 'xl';
  selectedServices: number[];
  petName: string;
  petBreed: string;
  photoFile: File | null;
  photoPreview: string | null;
}

interface BookingState {
  pets: PetBooking[];
  groomerId: number | null;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  acceptTerms: boolean;
}

const SIZE_PRICE_KEY: Record<string, keyof Service> = { 
  xs: 'priceXs', s: 'priceS', m: 'priceM', l: 'priceL', xl: 'priceXl' 
};
const SIZE_DURATION_KEY: Record<string, keyof Service> = {
  xs: 'durationXs', s: 'durationS', m: 'durationM', l: 'durationL', xl: 'durationXl'
};

const AVAILABLE_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export async function getServerSideProps({ res }: any) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://glanz-groom.netlify.app/api';
    const [servicesRes, groomersRes, settingsRes] = await Promise.all([
      fetch(`${apiUrl}/services`),
      fetch(`${apiUrl}/groomers`),
      fetch(`${apiUrl}/settings`)
    ]);
    const services = await servicesRes.json();
    const groomers = await groomersRes.json();
    const settings = await settingsRes.json();
    return {
      props: {
        initialServices: Array.isArray(services) ? services.filter((s: any) => s.isActive) : [],
        initialGroomers: Array.isArray(groomers) ? groomers.filter((g: any) => g.isActive) : [],
        initialSettings: settings || {}
      }
    };
  } catch (e) {
    return { props: { initialServices: [], initialGroomers: [], initialSettings: {} } };
  }
}

export default function BookPage({ initialServices, initialGroomers, initialSettings }: { initialServices: Service[], initialGroomers: Groomer[], initialSettings: Record<string, string> }) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [groomers, setGroomers] = useState<Groomer[]>(initialGroomers || []);
  const [breedsConfig, setBreedsConfig] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busySlots, setBusySlots] = useState<{groomerId: number, date: string, duration: number}[]>([]);
  const [expandedDesc, setExpandedDesc] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STEPS = [t.book.steps.services, t.book.steps.groomer, t.book.steps.time, t.book.steps.details];
  const SIZE_LABELS: Record<string, string> = { 
    xs: t.book.step0.sizes.xs, s: t.book.step0.sizes.s, m: t.book.step0.sizes.m, l: t.book.step0.sizes.l, xl: t.book.step0.sizes.xl 
  };

  const [booking, setBooking] = useState<BookingState>({
    pets: [],
    groomerId: null,
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    acceptTerms: false,
  });

  // Handle initialization and query params
  useEffect(() => {
    if (initialServices) setServices(initialServices);
    if (initialGroomers) setGroomers(initialGroomers);
    
    if (initialSettings) {
      const sets = initialSettings;
      const parseBreeds = (val: string | undefined): string[] => {
        if (!val) return [];
        try {
          const arr = JSON.parse(val);
          if (Array.isArray(arr)) return arr.map((a: any) => a.name).filter(Boolean);
          return val.split(',').map(s => s.trim()).filter(Boolean);
        } catch {
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
      };

      setBreedsConfig({
        xs: parseBreeds(sets.breeds_xs),
        s: parseBreeds(sets.breeds_s),
        m: parseBreeds(sets.breeds_m),
        l: parseBreeds(sets.breeds_l),
        xl: parseBreeds(sets.breeds_xl)
      });
    }

    const loadedServices = initialServices || [];
    
    // Parse query params after loading services so we can map names to IDs
    if (router.query.size) {
      const s = router.query.size as string;
      if (['xs', 's', 'm', 'l', 'xl'].includes(s)) {
        setBooking(b => ({ ...b, pets: [{ ...b.pets[0], petSize: s as any }] }));
      }
    }
    if (router.query.services) {
      const urlServiceNames = (router.query.services as string).split(',');
      const matchingIds = loadedServices
        .filter(s => urlServiceNames.includes(s.name) || urlServiceNames.includes(s.nameUk) || urlServiceNames.includes(s.nameEn || ''))
        .map(s => s.id);
      
      if (matchingIds.length > 0) {
        setBooking(b => ({ ...b, pets: [{ ...b.pets[0], selectedServices: matchingIds }] }));
      }
    }
  }, [router.query.size, router.query.services, initialServices, initialGroomers, initialSettings]);

  const [busySlotsDate, setBusySlotsDate] = useState('');

  // Fetch busy slots when date changes
  useEffect(() => {
    if (booking.date) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      fetch(`${apiUrl}/appointments/availability?date=${booking.date}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBusySlots(data);
            setBusySlotsDate(booking.date);
          }
        })
        .catch(console.error);
    } else {
      setBusySlots([]);
      setBusySlotsDate('');
    }
  }, [booking.date]);

  const packages = services.filter(s => s.category === 'package');
  const addons = services.filter(s => s.category === 'addon');
  const totalPrice = booking.pets.reduce((sum, pet) => {
    const priceKey = SIZE_PRICE_KEY[pet.petSize];
    return sum + pet.selectedServices
      .map(id => services.find(s => s.id === id))
      .filter(Boolean)
      .reduce((sSum, s) => sSum + (Number(s![priceKey]) || 0), 0);
  }, 0);

  const totalDuration = booking.pets.reduce((sum, pet) => {
    const durationKey = SIZE_DURATION_KEY[pet.petSize];
    return sum + pet.selectedServices
      .map(id => services.find(s => s.id === id))
      .filter(Boolean)
      .reduce((sSum, s) => sSum + (Number(s![durationKey]) || 0), 0);
  }, 0);

  const getAvailableTimes = () => {
    if (!booking.date) return [];
    
    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const minsToTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const groomerBusyRanges: Record<number, {start: number, end: number}[]> = {};
    busySlots.forEach(slot => {
      const d = new Date(slot.date);
      const startMins = d.getUTCHours() * 60 + d.getUTCMinutes(); 
      const endMins = startMins + slot.duration;
      if (!groomerBusyRanges[slot.groomerId]) groomerBusyRanges[slot.groomerId] = [];
      groomerBusyRanges[slot.groomerId].push({ start: startMins, end: endMins });
    });

    const isSlotFreeForGroomer = (timeMins: number, gId: number) => {
      const slotEnd = timeMins + totalDuration;
      if (slotEnd > 18 * 60) return false; // Store closes at 18:00
      const ranges = groomerBusyRanges[gId] || [];
      return !ranges.some(r => (timeMins < r.end && slotEnd > r.start)); // check overlap
    };

    const generatedTimes: string[] = [];
    const startOfDay = 10 * 60; // 10:00
    const endOfDay = 18 * 60; // 18:00

    for (let mins = startOfDay; mins <= endOfDay - totalDuration; mins += 15) {
      if (booking.groomerId === -1) {
        generatedTimes.push(minsToTime(mins));
      } else if (booking.groomerId === 0) {
        if (groomers.some(g => isSlotFreeForGroomer(mins, g.id))) {
          generatedTimes.push(minsToTime(mins));
        }
      } else if (booking.groomerId !== null) {
        if (isSlotFreeForGroomer(mins, booking.groomerId)) {
          generatedTimes.push(minsToTime(mins));
        }
      }
    }

    return generatedTimes;
  };

  // Auto-jump to next day if no slots available
  useEffect(() => {
    if (step === 2 && booking.date && busySlotsDate === booking.date && booking.groomerId !== -1) {
      if (getAvailableTimes().length === 0) {
        // Prevent infinite loop if something goes wrong, only auto-jump up to 30 times
        const jumpLimit = sessionStorage.getItem('jumpLimit') ? Number(sessionStorage.getItem('jumpLimit')) : 0;
        if (jumpLimit < 30) {
          sessionStorage.setItem('jumpLimit', String(jumpLimit + 1));
          const nextDate = new Date(booking.date);
          nextDate.setDate(nextDate.getDate() + 1);
          setBooking(b => ({ ...b, date: nextDate.toISOString().split('T')[0], time: '' }));
        }
      } else {
        sessionStorage.removeItem('jumpLimit');
      }
    }
  }, [step, booking.date, busySlotsDate, booking.groomerId, totalDuration]);

  const toggleServiceForSize = (serviceId: number, size: 'xs' | 's' | 'm' | 'l' | 'xl', isPackage: boolean) => {
    setBooking(b => {
      const newPets = [...b.pets];
      let petIndex = newPets.findIndex(p => p.petSize === size);
      
      if (petIndex === -1) {
        newPets.push({
          id: Date.now().toString() + '-' + size,
          petSize: size,
          selectedServices: [],
          petName: '',
          petBreed: '',
          photoFile: null,
          photoPreview: null
        });
        petIndex = newPets.length - 1;
      }
      
      const pet = { ...newPets[petIndex] };
      const packageIds = packages.map(p => p.id);

      if (isPackage) {
        const other = pet.selectedServices.filter(sid => !packageIds.includes(sid));
        pet.selectedServices = pet.selectedServices.includes(serviceId) ? other : [...other, serviceId];
      } else {
        if (pet.selectedServices.includes(serviceId)) {
          pet.selectedServices = pet.selectedServices.filter(x => x !== serviceId);
        } else {
          pet.selectedServices = [...pet.selectedServices, serviceId];
        }
      }
      
      if (pet.selectedServices.length === 0) {
         newPets.splice(petIndex, 1);
      } else {
         newPets[petIndex] = pet;
      }

      return { ...b, pets: newPets };
    });
  };

  const handlePhotoChange = async (petIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t.book.step3.photoError);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBooking(b => {
          const newPets = [...b.pets];
          newPets[petIndex] = { ...newPets[petIndex], photoFile: file, photoPreview: reader.result as string };
          return { ...b, pets: newPets };
        });
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const canNext = () => {
    if (step === 0) return booking.pets.length > 0 && booking.pets.every(p => p.selectedServices.length > 0);
    if (step === 1) return booking.groomerId !== null;
    if (step === 2) return booking.date && booking.time;
    if (step === 3) return booking.firstName && booking.email && booking.phone && booking.pets.every(p => p.petName) && booking.acceptTerms;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const dateTime = new Date(`${booking.date}T${booking.time}:00`);
      let currentDateTime = dateTime;

      for (const pet of booking.pets) {
        let petPhotoUrl = null;
        if (pet.photoFile) {
          const formData = new FormData();
          formData.append('photo', pet.photoFile);
          const uploadRes = await fetch(`${apiUrl}/upload/pet-photo`, {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            petPhotoUrl = (await uploadRes.json()).url;
          }
        }

        const durationKey = SIZE_DURATION_KEY[pet.petSize];
        const petDuration = pet.selectedServices
          .map(id => services.find(s => s.id === id))
          .filter(Boolean)
          .reduce((sum, s) => sum + (Number(s![durationKey]) || 0), 0);
        
        const priceKey = SIZE_PRICE_KEY[pet.petSize];
        const petPrice = pet.selectedServices
          .map(id => services.find(s => s.id === id))
          .filter(Boolean)
          .reduce((sum, s) => sum + (Number(s![priceKey]) || 0), 0);

        const res = await fetch(`${apiUrl}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientFirstName: booking.firstName,
            clientLastName: booking.lastName,
            clientEmail: booking.email,
            clientPhone: booking.phone,
            petName: pet.petName,
            petBreed: pet.petBreed,
            petSize: pet.petSize,
            petPhotoUrl,
            notes: booking.notes,
            groomerId: booking.groomerId,
            date: currentDateTime.toISOString(),
            serviceIds: pet.selectedServices,
            duration: petDuration,
            totalPrice: petPrice
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Fehler beim Erstellen');
        }

        currentDateTime = new Date(currentDateTime.getTime() + petDuration * 60000);
      }
      
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.book.step3.submitError);
    } finally {
      setLoading(false);
    }
  };

  const generateICS = () => {
    const dateTime = new Date(`${booking.date}T${booking.time}:00`);
    const endDateTime = new Date(dateTime.getTime() + totalDuration * 60000);
    
    const formatDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const serviceNames = booking.pets.map(pet => 
      pet.selectedServices
        .map(id => services.find(s => s.id === id))
        .filter(Boolean)
        .map(s => locale === 'en' && s?.nameEn ? s.nameEn : s?.name)
        .join(', ')
    ).join(' | ');

    const petNames = booking.pets.map(p => p.petName).join(', ');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Glanz & Groom//DE',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@glanzgroom.de`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(dateTime)}`,
      `DTEND:${formatDate(endDateTime)}`,
      `SUMMARY:Grooming ${petNames} (Glanz & Groom)`,
      `DESCRIPTION:Services: ${serviceNames}. Duration: ${totalDuration} min.`,
      `LOCATION:Glanz & Groom Salon`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `grooming_${petNames.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openGoogleCalendar = () => {
    const dateTime = new Date(`${booking.date}T${booking.time}:00`);
    const endDateTime = new Date(dateTime.getTime() + totalDuration * 60000);
    
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const serviceNames = booking.pets.map(pet => 
      pet.selectedServices
        .map(id => services.find(s => s.id === id))
        .filter(Boolean)
        .map(s => locale === 'en' && s?.nameEn ? s.nameEn : s?.name)
        .join(', ')
    ).join(' | ');

    const petNames = booking.pets.map(p => p.petName).join(', ');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Grooming ${petNames} (Glanz & Groom)`,
      dates: `${formatDate(dateTime)}/${formatDate(endDateTime)}`,
      details: `Services: ${serviceNames}. Duration: ${totalDuration} min.`,
      location: 'Glanz & Groom Salon',
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  const getServiceName = (svc: Service) => locale === 'en' && svc.nameEn ? svc.nameEn : svc.name;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center py-12">
        <Head>
          <title>{t.book.title}</title>
        </Head>
        <div className="bg-surface-container-lowest rounded-3xl p-10 shadow-xl border border-surface-variant max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined fill text-[48px] text-green-600">check_circle</span>
          </div>
          <h1 className="font-display text-headline-lg text-on-background mb-2">{t.book.success.title}</h1>
          <p className="font-sans text-body-md text-on-surface-variant mb-6">
            {t.book.success.desc1} <strong>{booking.pets.map(p => p.petName).join(', ')}</strong> {t.book.success.desc2}
          </p>

          {booking.pets[0]?.photoPreview && (
            <div className="mb-6 flex flex-wrap gap-4 justify-center">
              {booking.pets.map(p => p.photoPreview && (
                <img key={p.id} src={p.photoPreview} alt="Pet" className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-md" />
              ))}
            </div>
          )}

          <div className="bg-surface-container rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between"><span className="font-sans text-label-lg text-on-surface-variant">{t.book.success.date}</span><span className="font-sans text-label-lg text-on-surface font-semibold">{new Date(booking.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE')} {booking.time}</span></div>
            <div className="flex justify-between"><span className="font-sans text-label-lg text-on-surface-variant">{t.book.success.duration}</span><span className="font-sans text-label-lg text-on-surface">{totalDuration} {t.book.step0.min}</span></div>
            <div className="flex justify-between"><span className="font-sans text-label-lg text-on-surface-variant">{t.book.success.sum}</span><span className="font-display font-bold text-primary">{totalPrice}€</span></div>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={openGoogleCalendar}
              className="w-full border-2 border-outline flex items-center justify-center gap-2 bg-white text-on-surface font-sans text-label-lg py-3 rounded-full hover:bg-surface-container transition-all"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-5 h-5" />
              {t.book.success.addToCalendar}
            </button>
            <button
              onClick={generateICS}
              className="w-full border-2 border-outline flex items-center justify-center gap-2 bg-white text-on-surface font-sans text-label-lg py-3 rounded-full hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              {t.book.success.downloadIcs}
            </button>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary text-on-primary font-sans text-label-lg py-3 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all"
          >
            {t.book.success.goHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Head>
        <title>{t.book.title}</title>
        <meta name="description" content={t.book.metaDesc} />
      </Head>

      {/* Mobile header */}
      <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-surface-variant">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="text-on-surface hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-display text-headline-md text-primary">{t.book.headerTitle}</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col px-6 py-md gap-lg max-w-2xl mx-auto w-full pb-32">
        {/* Progress steps */}
        <div className="flex items-center justify-between w-full relative mt-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-variant rounded-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s, i) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-label-sm shadow-sm transition-all ${
                i < step ? 'bg-primary text-on-primary' :
                i === step ? 'bg-primary text-on-primary ring-4 ring-primary/20' :
                'bg-surface-variant text-on-surface-variant'
              }`}>
                {i < step ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
              </div>
              <span className={`font-sans text-label-sm ${i === step ? 'text-primary' : 'text-on-surface-variant'}`}>{s}</span>
            </div>
          ))}
        </div>

        {/* ── STEP 0: Services ── */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="font-display text-headline-lg text-on-surface">Leistungen wählen</h2>
              <p className="font-sans text-body-md text-on-surface-variant">Bitte wählen Sie die gewünschten Leistungen für Ihren Hund.</p>
            </div>

            <div className="flex flex-col gap-4">
               {services.map(svc => {
                  const isExpanded = expandedDesc[svc.id];
                  const isPackage = svc.category === 'package';
                  const SIZES = ['xs', 's', 'm', 'l', 'xl'] as const;
                  const BREED_IMAGES = {
                     xs: '/breeds/chihuahua.png',
                     s: '/breeds/yorkie.png',
                     m: '/breeds/cocker.png',
                     l: '/breeds/golden.png',
                     xl: '/breeds/gsd.png'
                  };

                  return (
                     <div key={svc.id} className="bg-surface-container-low rounded-2xl border border-surface-variant overflow-hidden shadow-sm">
                        <div 
                           className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container transition-colors"
                           onClick={() => setExpandedDesc(prev => ({ ...prev, [svc.id]: !prev[svc.id] }))}
                        >
                           <div className="flex flex-col">
                              <h3 className="font-display font-bold text-lg text-on-surface uppercase tracking-wide">{getServiceName(svc)}</h3>
                              <p className={`text-sm text-on-surface-variant ${isExpanded ? '' : 'line-clamp-1'} mt-1`}>{svc.description}</p>
                           </div>
                           <span className="material-symbols-outlined text-primary transition-transform ml-4 shrink-0" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              expand_more
                           </span>
                        </div>
                        
                        {isExpanded && (
                           <div className="p-4 bg-surface border-t border-surface-variant flex flex-col gap-4">
                              {SIZES.map(size => {
                                 const priceKey = SIZE_PRICE_KEY[size] as keyof Service;
                                 const durationKey = SIZE_DURATION_KEY[size] as keyof Service;
                                 const p = Number(svc[priceKey]) || 0;
                                 const d = Number(svc[durationKey]) || 0;
                                 if (p === 0) return null;

                                 const pet = booking.pets.find(p => p.petSize === size);
                                 const isSelected = pet?.selectedServices.includes(svc.id) || false;

                                 return (
                                    <label key={size} className={`flex flex-row items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-outline hover:border-primary/50'}`}>
                                       <div className="w-24 h-24 rounded-xl bg-surface-container overflow-hidden shrink-0 hidden sm:block">
                                          <img src={BREED_IMAGES[size]} alt={size} className="w-full h-full object-cover" />
                                       </div>
                                       <div className="flex flex-col flex-1">
                                          <div className="flex justify-between items-start mb-2">
                                             <span className="font-bold text-primary uppercase bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-xs">
                                                RASSEN
                                             </span>
                                             <div className="relative flex items-center justify-center">
                                                <input 
                                                   type="checkbox" 
                                                   className="sr-only"
                                                   checked={isSelected}
                                                   onChange={() => toggleServiceForSize(svc.id, size, isPackage)}
                                                />
                                                <div className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-outline hover:border-primary'}`}>
                                                   {isSelected && <span className="material-symbols-outlined text-on-primary text-[18px]">check</span>}
                                                </div>
                                             </div>
                                          </div>
                                          <p className="text-[11px] text-on-surface-variant font-semibold mb-2 leading-tight uppercase">
                                             {breedsConfig[size]?.join(', ') || SIZE_LABELS[size]}
                                          </p>
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-outline-variant pt-2 mt-auto">
                                             <div>
                                                <h4 className="font-bold text-on-surface text-sm">{size.toUpperCase()} <span className="font-normal text-on-surface-variant">({SIZE_LABELS[size]})</span></h4>
                                                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                                                   <span className="material-symbols-outlined text-[12px]">schedule</span> {d} Min
                                                </p>
                                             </div>
                                             <p className="font-display font-bold text-lg text-primary">{p} €</p>
                                          </div>
                                       </div>
                                    </label>
                                 )
                              })}
                           </div>
                        )}
                     </div>
                  )
               })}
            </div>
          </div>
        )}

        {/* ── STEP 1: Groomer ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="font-display text-headline-lg text-on-surface">{t.book.step1.title}</h2>
              <p className="font-sans text-body-md text-on-surface-variant">{t.book.step1.desc}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {groomers.map(g => (
                <label key={g.id} className="relative block cursor-pointer">
                  <input type="radio" name="groomer" className="sr-only" checked={booking.groomerId === g.id} onChange={() => setBooking({ ...booking, groomerId: g.id })} />
                  <div className={`bg-surface border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${booking.groomerId === g.id ? 'border-primary shadow-md' : 'border-surface-variant hover:border-outline'}`}>
                    {g.photoUrl ? (
                      <img src={g.photoUrl as string} alt={g.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full text-white flex items-center justify-center font-display text-xl shrink-0" style={{ backgroundColor: g.color }}>
                        {g.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-sans text-label-lg text-on-surface">{g.name}</p>
                      <p className="font-sans text-body-sm text-on-surface-variant">{g.role}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${booking.groomerId === g.id ? 'border-primary bg-primary' : 'border-outline'}`}>
                      {booking.groomerId === g.id && <div className="w-2.5 h-2.5 bg-on-primary rounded-full" />}
                    </div>
                  </div>
                </label>
              ))}
              <label className="relative block cursor-pointer mt-2">
                <input type="radio" name="groomer" className="sr-only" checked={booking.groomerId === 0} onChange={() => setBooking({ ...booking, groomerId: 0 })} />
                <div className={`bg-surface border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${booking.groomerId === 0 ? 'border-primary shadow-md' : 'border-surface-variant hover:border-outline'}`}>
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">calendar_clock</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-label-lg text-on-surface">{t.book.step1.any}</p>
                    <p className="font-sans text-body-sm text-on-surface-variant">{t.book.step1.anyDesc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${booking.groomerId === 0 ? 'border-primary bg-primary' : 'border-outline'}`}>
                    {booking.groomerId === 0 && <div className="w-2.5 h-2.5 bg-on-primary rounded-full" />}
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ── STEP 2: Time ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6 pb-32">
            <div className="text-center">
              <h2 className="font-display text-headline-lg text-on-surface">{t.book.step2.title}</h2>
              <p className="font-sans text-body-md text-on-surface-variant">{t.book.step2.desc}</p>
            </div>

            {/* Custom Calendar */}
            <MiniCalendar
              value={booking.date}
              onChange={date => setBooking({ ...booking, date, time: '' })}
            />

            {/* Time slots */}
            {booking.date && (
              <div className="flex flex-col gap-3">
                <p className="font-sans text-label-lg text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                  Verfügbare Zeiten
                </p>
                {getAvailableTimes().length === 0 && booking.groomerId !== null && booking.groomerId > 0 ? (
                  <div className="text-center bg-surface-container-high border border-outline-variant p-6 rounded-2xl mt-4">
                    <span className="material-symbols-outlined text-primary text-[32px] mb-2">event_busy</span>
                    <p className="font-sans text-label-lg text-on-surface mb-2">
                      На жаль, цей майстер повністю зайнятий на обраний день.
                    </p>
                    <button 
                      onClick={() => setBooking({...booking, groomerId: 0, time: ''})}
                      className="mt-4 px-6 py-3 bg-primary text-on-primary rounded-full font-sans text-label-md hover:opacity-90 transition-opacity"
                    >
                      Показати вільні години у інших майстрів
                    </button>
                  </div>
                ) : getAvailableTimes().length === 0 && booking.groomerId === 0 ? (
                  <div className="text-center bg-amber-50 border border-amber-200 p-6 rounded-2xl mt-4">
                    <span className="material-symbols-outlined text-amber-600 text-[32px] mb-2">pending_actions</span>
                    <p className="font-sans text-label-lg text-amber-900 mb-2">
                      На жаль, на цей день усі майстри зайняті. Ви можете залишити запит у Лист очікування.
                    </p>
                    <button 
                      onClick={() => setBooking({...booking, groomerId: -1, time: ''})}
                      className="mt-4 px-6 py-3 bg-amber-600 text-white rounded-full font-sans text-label-md hover:bg-amber-700 transition-colors"
                    >
                      Записатись у Лист очікування
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {booking.groomerId === -1 && (
                      <p className="font-sans text-label-sm text-amber-700 bg-amber-100 p-3 rounded-xl border border-amber-200">
                        Виберіть бажаний час. Запис потрапить у лист очікування, і ми зв'яжемося з вами, якщо з'явиться вільне місце.
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      {getAvailableTimes().map(time => (
                        <button
                          key={time}
                          onClick={() => setBooking({ ...booking, time })}
                          className={`py-3 rounded-xl font-sans text-label-md transition-all border-2 ${
                            booking.time === time
                              ? 'bg-primary border-primary text-on-primary shadow-sm scale-105'
                              : 'bg-surface border-surface-variant text-on-surface-variant hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Details ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="font-display text-headline-lg text-on-surface">{t.book.step3.title}</h2>
              <p className="font-sans text-body-md text-on-surface-variant">{t.book.step3.desc}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.firstName}</label>
                  <input type="text" value={booking.firstName} onChange={e => setBooking({ ...booking, firstName: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.firstNamePh} />
                </div>
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.lastName}</label>
                  <input type="text" value={booking.lastName} onChange={e => setBooking({ ...booking, lastName: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.lastNamePh} />
                </div>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.phone}</label>
                <input type="tel" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.phonePh} />
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.email}</label>
                <input type="email" value={booking.email} onChange={e => setBooking({ ...booking, email: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.emailPh} />
              </div>

              {booking.pets.map((pet, petIndex) => {
                 const petServices = pet.selectedServices
                    .map(id => services.find(s => s.id === id))
                    .filter(Boolean)
                    .map(s => getServiceName(s!))
                    .join(', ');

                 return (
                <div key={pet.id} className="p-4 bg-surface-container-low border border-surface-variant rounded-xl mt-4">
                  <h3 className="font-display text-label-lg font-bold text-primary mb-1 pb-2 border-b border-outline">
                    Hund {petIndex + 1} ({pet.petSize.toUpperCase()} - {SIZE_LABELS[pet.petSize]})
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4 italic">Gewählte Leistungen: {petServices}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Name des Hundes</label>
                      <input type="text" value={pet.petName} onChange={e => {
                        const newPets = [...booking.pets];
                        newPets[petIndex] = { ...pet, petName: e.target.value };
                        setBooking({ ...booking, pets: newPets });
                      }} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder="z.B. Rex" />
                    </div>
                    <div>
                      <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Hunderasse</label>
                      <input type="text" list={`breed-suggestions-${pet.id}`} value={pet.petBreed} onChange={e => {
                        const newPets = [...booking.pets];
                        newPets[petIndex] = { ...pet, petBreed: e.target.value };
                        setBooking({ ...booking, pets: newPets });
                      }} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder="z.B. Chihuahua" />
                      {breedsConfig[pet.petSize] && breedsConfig[pet.petSize].length > 0 && (
                        <datalist id={`breed-suggestions-${pet.id}`}>
                          {breedsConfig[pet.petSize].map(b => (
                            <option key={b} value={b} />
                          ))}
                        </datalist>
                      )}
                    </div>
                  </div>

                  {/* Pet Photo Upload */}
                  <div className="mt-4">
                    <label className="block font-sans text-label-sm text-on-surface-variant mb-1">Foto des Hundes (optional)</label>
                    <div 
                      onClick={() => {
                        const input = document.getElementById(`photoUpload-${pet.id}`);
                        if (input) input.click();
                      }}
                      className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${pet.photoPreview ? 'border-primary bg-primary-container/10' : 'border-outline hover:border-primary bg-surface'}`}
                    >
                      <input 
                        type="file" 
                        id={`photoUpload-${pet.id}`}
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handlePhotoChange(petIndex, e as any)}
                      />
                      {pet.photoPreview ? (
                        <div className="flex items-center gap-4 w-full">
                          <img src={pet.photoPreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-outline" />
                          <div className="flex-1">
                            <p className="font-sans text-label-md text-on-surface font-semibold">{pet.photoFile?.name}</p>
                            <p className="font-sans text-body-sm text-primary hover:underline">Foto ändern</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-2">add_a_photo</span>
                          <p className="font-sans text-label-md text-on-surface">Foto hochladen</p>
                          <p className="font-sans text-body-sm text-on-surface-variant">JPG, PNG (max. 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

              <div className="mt-4">
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.notes}</label>
                <textarea value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" rows={3} placeholder={t.book.step3.notesPh}></textarea>
              </div>

              <div className="pt-4 border-t border-surface-variant">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={booking.acceptTerms} 
                      onChange={e => setBooking({ ...booking, acceptTerms: e.target.checked })} 
                    />
                    <div className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${booking.acceptTerms ? 'bg-primary border-primary' : 'bg-surface border-outline group-hover:border-primary'}`}>
                      {booking.acceptTerms && <span className="material-symbols-outlined text-on-primary text-[18px]">check</span>}
                    </div>
                  </div>
                  <span className="font-sans text-body-sm text-on-surface-variant leading-tight">
                    Ich bin mit den <a href="/agb" className="text-primary hover:underline" target="_blank" onClick={e => e.stopPropagation()}>Allgemeinen Geschäftsbedingungen</a> einverstanden und bestätige, dass mein Hund keine ansteckenden Krankheiten hat.
                  </span>
                </label>
              </div>
            </div>
            {error && <div className="p-4 bg-error-container text-on-error-container rounded-xl font-sans text-body-sm text-center">{error}</div>}
          </div>
        )}

      </main>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-[72px] md:bottom-0 left-0 w-full bg-surface border-t border-surface-variant p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-sans text-label-sm text-on-surface-variant">{t.book.footer.totalToPay}</p>
            <p className="font-display text-headline-sm text-primary">{totalPrice}€</p>
            {totalDuration > 0 && <p className="font-sans text-[10px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> {totalDuration} {t.book.step0.min}</p>}
          </div>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="bg-primary text-on-primary font-sans text-label-lg py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              {t.book.footer.next}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || loading}
              className="bg-primary text-on-primary font-sans text-label-lg py-3 px-8 rounded-full disabled:opacity-50 flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : t.book.footer.book}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
