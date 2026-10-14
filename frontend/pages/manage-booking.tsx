import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';

interface AppointmentData {
  id: number;
  date: string;
  duration: number;
  totalPrice: number;
  status: string;
  clientConfirmationStatus: 'pending' | 'confirmed' | 'cancelled' | 'late_cancel_attempt';
  clientConfirmedAt: string | null;
  lateCancelAttemptAt: string | null;
  cancellationReason: string | null;
  hoursUntilAppointment: number;
  canCancelOnline: boolean;
  minCancellationHours: number;
  client: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  pet: {
    name: string;
    breed: string;
    size: string;
  };
  groomer: {
    name: string;
    role: string;
    photoUrl?: string | null;
  };
  services: Array<{
    price: number;
    name: string;
    nameUk?: string;
  }>;
  salon: {
    name: string;
    phone: string;
    whatsapp: string;
    address: string;
    email: string;
  };
}

export default function ManageBookingPage() {
  const router = useRouter();
  const { locale } = useTranslation();
  const { token, action } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apt, setApt] = useState<AppointmentData | null>(null);

  // Modal & action states
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [lateAttemptRegistered, setLateAttemptRegistered] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://glanz-groom.netlify.app/api';

  // Load appointment by token
  const loadAppointment = async (manageToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/appointments/manage/${manageToken}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Termin konnte nicht gefunden werden.');
      }
      const data: AppointmentData = await res.json();
      setApt(data);

      // Handle auto-confirm if action=confirm was passed in URL and not yet confirmed
      if (action === 'confirm' && data.status !== 'cancelled' && data.clientConfirmationStatus !== 'confirmed') {
        handleConfirm(manageToken, false);
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Termindaten.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && typeof token === 'string') {
      loadAppointment(token);
    }
  }, [token, action]);

  // Client confirms
  const handleConfirm = async (manageToken = token as string, showFeedback = true) => {
    try {
      setSubmitting(true);
      const res = await fetch(`${API}/appointments/manage/${manageToken}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der Bestätigung.');
      }
      setApt(prev => prev ? {
        ...prev,
        clientConfirmationStatus: 'confirmed',
        clientConfirmedAt: data.clientConfirmedAt || new Date().toISOString()
      } : null);
      if (showFeedback) {
        setActionSuccess('Vielen Dank! Ihr Termin wurde erfolgreich bestätigt.');
      }
    } catch (err: any) {
      setError(err.message || 'Bestätigung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  // Client cancels (>=24h) or alerts salon (<24h)
  const handleCancel = async () => {
    if (!token || typeof token !== 'string') return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`${API}/appointments/manage/${token}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.late) {
          // Late cancellation attempt registered
          setLateAttemptRegistered(true);
          setApt(prev => prev ? {
            ...prev,
            clientConfirmationStatus: 'late_cancel_attempt',
            lateCancelAttemptAt: new Date().toISOString()
          } : null);
          setShowCancelModal(false);
          return;
        }
        throw new Error(data.error || 'Stornierung fehlgeschlagen.');
      }

      // Successfully cancelled
      setApt(prev => prev ? {
        ...prev,
        status: 'cancelled',
        clientConfirmationStatus: 'cancelled',
        cancellationReason: cancelReason || 'Vom Kunden online storniert'
      } : null);
      setShowCancelModal(false);
      setActionSuccess('Ihr Termin wurde erfolgreich storniert.');
    } catch (err: any) {
      setError(err.message || 'Stornierung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar helpers
  const getGoogleCalendarUrl = () => {
    if (!apt) return '';
    const start = new Date(apt.date);
    const end = new Date(start.getTime() + (apt.duration || 60) * 60_000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const toGCal = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

    const title = encodeURIComponent(`Grooming: ${apt.pet.name} – Glanz & Groom`);
    const details = encodeURIComponent(`Termin für ${apt.pet.name} (${apt.pet.breed}).\nSalon: ${apt.salon.address}\nTel: ${apt.salon.phone}`);
    const location = encodeURIComponent(apt.salon.address);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${toGCal(start)}/${toGCal(end)}&details=${details}&location=${location}`;
  };

  const getWhatsAppSalonUrl = (msgText?: string) => {
    if (!apt) return '';
    const phone = apt.salon.whatsapp.replace(/\D/g, '');
    const dateFormatted = new Date(apt.date).toLocaleString('de-DE', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    const defaultMsg = `Hallo Glanz & Groom! Ich habe eine Frage zu meinem Termin am ${dateFormatted} für ${apt.pet.name}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msgText || defaultMsg)}`;
  };

  const formattedDate = apt ? new Date(apt.date).toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) : '';

  const formattedTime = apt ? new Date(apt.date).toLocaleTimeString('de-DE', {
    hour: '2-digit', minute: '2-digit'
  }) : '';

  return (
    <Layout>
      <Head>
        <title>Termin verwalten | Glanz & Groom</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-surface-container-lowest py-8 md:py-14 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Top Logo / Breadcrumb */}
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
            <Link href="/" className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors font-display font-bold text-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">pets</span>
              <span>Glanz & Groom</span>
            </Link>
            <span className="font-sans text-label-md text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
              Kunden-Service
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-surface rounded-3xl p-12 text-center border border-outline-variant shadow-sm space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="font-sans text-body-lg text-on-surface-variant font-medium">
                Termindaten werden geladen...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && !apt && (
            <div className="bg-error-container text-on-error-container rounded-3xl p-8 border border-error/20 text-center space-y-4 shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-error">error</span>
              <h2 className="font-display text-xl font-bold">Termin nicht gefunden</h2>
              <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">
                {error || 'Der Link ist ungültig oder abgelaufen. Bitte überprüfen Sie den Link in Ihrer Bestätigungs-E-Mail oder kontaktieren Sie uns direkt.'}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-label-lg font-bold px-6 py-2.5 rounded-full shadow hover:bg-primary/90 transition-all"
                >
                  Zur Startseite
                </Link>
              </div>
            </div>
          )}

          {/* Main Appointment Management Card */}
          {!loading && apt && (
            <div className="space-y-6">

              {/* Success Banner */}
              {actionSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm animate-fade-in">
                  <span className="material-symbols-outlined text-[24px] text-green-700 shrink-0">check_circle</span>
                  <p className="font-sans text-body-md font-semibold">{actionSuccess}</p>
                </div>
              )}

              {/* Status Header Banner */}
              {apt.status === 'cancelled' ? (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-[28px]">cancel</span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-red-900">Termin storniert</h1>
                  <p className="font-sans text-body-md text-red-700 max-w-md mx-auto">
                    Dieser Termin wurde storniert und ist nicht mehr aktiv.
                    {apt.cancellationReason && (
                      <span className="block mt-1 text-sm italic">Grund: „{apt.cancellationReason}“</span>
                    )}
                  </p>
                  <div className="pt-3">
                    <Link
                      href="/book"
                      className="inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-label-lg font-bold px-6 py-2.5 rounded-full shadow hover:bg-primary/90 transition-all"
                    >
                      Neuen Termin buchen
                    </Link>
                  </div>
                </div>
              ) : apt.clientConfirmationStatus === 'confirmed' ? (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-[28px]">verified</span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-green-900">Termin ist bestätigt!</h1>
                  <p className="font-sans text-body-md text-green-800">
                    Wir freuen uns auf Sie und <strong>{apt.pet.name}</strong>!
                  </p>
                  {apt.clientConfirmedAt && (
                    <p className="font-sans text-label-sm text-green-700">
                      Bestätigt am {new Date(apt.clientConfirmedAt).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              ) : apt.clientConfirmationStatus === 'late_cancel_attempt' || lateAttemptRegistered ? (
                <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-[28px]">notification_important</span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-amber-900">Stornierungsanfrage eingegangen</h1>
                  <p className="font-sans text-body-md text-amber-900 max-w-lg mx-auto">
                    Da Ihr Termin in weniger als 24 Stunden stattfindet, ist eine automatische Online-Stornierung nicht möglich. Unser Team wurde benachrichtigt.
                  </p>
                  <p className="font-sans text-body-md text-amber-800 font-semibold">
                    Bitte kontaktieren Sie uns direkt per WhatsApp oder Telefon:
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-1">
                    <a
                      href={getWhatsAppSalonUrl(`Hallo Glanz & Groom! Ich habe um kurzfristige Stornierung für ${apt.pet.name} gebeten.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full font-sans text-label-lg font-bold shadow hover:bg-[#20b859] transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                      WhatsApp an den Salon
                    </a>
                    <a
                      href={`tel:${apt.salon.phone}`}
                      className="inline-flex items-center gap-2 bg-surface text-on-surface border border-outline-variant px-5 py-2.5 rounded-full font-sans text-label-lg font-bold hover:bg-surface-container transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">call</span>
                      {apt.salon.phone}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[28px]">schedule</span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-on-surface">Terminbestätigung</h1>
                  <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">
                    Bitte bestätigen Sie kurz, dass Sie und <strong>{apt.pet.name}</strong> pünktlich zum Termin erscheinen werden.
                  </p>
                  <button
                    onClick={() => handleConfirm()}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-label-lg font-bold px-8 py-3 rounded-full shadow-md hover:bg-primary/90 transition-all scale-105 active:scale-100"
                  >
                    <span className="material-symbols-outlined text-[20px]">check</span>
                    {submitting ? 'Wird bestätigt...' : 'Termin jetzt bestätigen'}
                  </button>
                </div>
              )}

              {/* Appointment Details Box */}
              <div className="bg-surface rounded-3xl border border-outline-variant shadow-sm overflow-hidden divide-y divide-outline-variant/60">
                
                {/* Time & Date Header */}
                <div className="p-6 bg-surface-container-low flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                      Terminzeitpunkt
                    </span>
                    <h2 className="font-display text-2xl font-bold text-on-surface">
                      {formattedDate}
                    </h2>
                    <p className="font-sans text-title-md text-primary font-semibold flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[20px]">schedule</span>
                      {formattedTime} Uhr ({apt.duration} Minuten)
                    </p>
                  </div>
                  {apt.status !== 'cancelled' && (
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-sans text-label-sm text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-full transition-colors font-semibold"
                      >
                        <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                        Zu Google Kalender
                      </a>
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pet Info */}
                  <div className="space-y-1">
                    <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">pets</span>
                      Vierbeiner
                    </span>
                    <p className="font-sans text-body-lg text-on-surface font-bold">
                      {apt.pet.name}
                    </p>
                    <p className="font-sans text-body-sm text-on-surface-variant">
                      Rasse: {apt.pet.breed || 'Nicht angegeben'} · Größe: {apt.pet.size.toUpperCase()}
                    </p>
                  </div>

                  {/* Groomer Info */}
                  <div className="space-y-1">
                    <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">content_cut</span>
                      Groomer / Betreuung
                    </span>
                    <p className="font-sans text-body-lg text-on-surface font-bold">
                      {apt.groomer.name}
                    </p>
                    <p className="font-sans text-body-sm text-on-surface-variant">
                      {apt.groomer.role || 'Grooming Spezialist'}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1">
                    <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      Kunde
                    </span>
                    <p className="font-sans text-body-md text-on-surface font-semibold">
                      {apt.client.firstName} {apt.client.lastName}
                    </p>
                    <p className="font-sans text-body-sm text-on-surface-variant">
                      {apt.client.phone}
                    </p>
                  </div>

                  {/* Salon Location */}
                  <div className="space-y-1">
                    <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      Salon-Adresse
                    </span>
                    <p className="font-sans text-body-md text-on-surface font-semibold">
                      {apt.salon.name}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(apt.salon.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-body-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {apt.salon.address}
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                </div>

                {/* Services List */}
                <div className="p-6 space-y-3">
                  <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider block">
                    Gebuchte Leistungen
                  </span>
                  <div className="space-y-2">
                    {apt.services.map((svc, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-outline-variant/30 last:border-0">
                        <span className="font-sans text-on-surface font-medium">{svc.name}</span>
                        <span className="font-sans font-bold text-on-surface">{svc.price} €</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant font-bold">
                    <span className="font-sans text-body-md text-on-surface">Gesamtbetrag (ca.):</span>
                    <span className="font-display text-xl text-primary">{apt.totalPrice} €</span>
                  </div>
                </div>
              </div>

              {/* 24-Hour Policy & Cancellation Box */}
              {apt.status !== 'cancelled' && (
                <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[24px] text-amber-600 mt-0.5 shrink-0">
                      info
                    </span>
                    <div className="space-y-1 text-sm">
                      <h3 className="font-sans font-bold text-on-surface">
                        Stornierungsbedingungen (24-Stunden-Regel)
                      </h3>
                      <p className="text-on-surface-variant leading-relaxed">
                        Eine kostenfreie Stornierung oder Verschiebung ist <strong>bis zu 24 Stunden vor dem Termin</strong> online möglich.
                        Bei kurzfristigeren Absagen wenden Sie sich bitte telefonisch an uns.
                      </p>
                      <p className="text-xs text-on-surface-variant font-medium pt-1">
                        Verbleibende Zeit bis zum Termin:{' '}
                        <span className={apt.hoursUntilAppointment >= 24 ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                          ca. {Math.max(0, Math.round(apt.hoursUntilAppointment))} Stunden
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/60">
                    {apt.canCancelOnline ? (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="font-sans text-label-md text-red-700 hover:text-red-900 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl transition-all"
                      >
                        Termin stornieren
                      </button>
                    ) : (
                      <div className="w-full space-y-2">
                        <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                          <span className="material-symbols-outlined text-[16px] text-red-600 shrink-0">block</span>
                          <span>Online-Stornierung unter 24 Stunden vor Beginn nicht möglich.</span>
                        </div>
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="w-full text-center font-sans text-label-sm text-on-surface-variant hover:text-red-700 hover:underline py-1"
                        >
                          Ich kann dennoch nicht kommen (Salon benachrichtigen)
                        </button>
                      </div>
                    )}

                    <a
                      href={getWhatsAppSalonUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-label-md text-on-surface-variant hover:text-primary flex items-center gap-1.5 ml-auto"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      Fragen zum Termin?
                    </a>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && apt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full border border-outline-variant shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <h3 className="font-display text-xl font-bold text-on-surface">
                {apt.canCancelOnline ? 'Termin stornieren?' : 'Kurzfristige Absage melden'}
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {apt.canCancelOnline ? (
              <p className="font-sans text-body-md text-on-surface-variant">
                Möchten Sie Ihren Termin am <strong>{formattedDate}</strong> um <strong>{formattedTime}</strong> Uhr für <strong>{apt.pet.name}</strong> wirklich absagen? Der Termin wird sofort freigegeben.
              </p>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">warning</span>
                  Kurzfristige Stornierung (&lt; 24 Stunden)
                </p>
                <p>
                  Gemäß unseren Salonregeln (AGB) kann der Termin so kurz vor Beginn nicht automatisch online storniert werden.
                  Wir leiten Ihre Mitteilung direkt an die Salonleitung weiter.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-sans text-label-sm text-on-surface-variant block">
                Grund der Absage (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="z.B. Hund ist krank, privater Notfall..."
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-3 font-sans text-body-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 font-sans text-label-lg text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="px-5 py-2.5 font-sans text-label-lg font-bold bg-red-700 text-white hover:bg-red-800 rounded-full shadow transition-all"
              >
                {submitting ? 'Wird übermittelt...' : apt.canCancelOnline ? 'Ja, Termin stornieren' : 'Absage übermitteln'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
