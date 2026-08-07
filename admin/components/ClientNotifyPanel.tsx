import React, { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

export type NotifyFields = {
  clientNotifyStatus?: string | null;
  clientNotifyChannel?: string | null;
  clientNotifyAt?: string | null;
  clientNotifyDetail?: string | null;
  client?: { phone?: string | null; email?: string | null; firstName?: string | null; lastName?: string | null } | null;
  pet?: { name?: string | null } | null;
  date?: string | Date | null;
  status?: string | null;
  id?: string | number;
};

function statusLabel(status?: string | null): { text: string; cls: string; icon: string } {
  switch (status) {
    case 'sent':
      return { text: 'E-Mail gesendet', cls: 'bg-green-100 text-green-800 border-green-200', icon: 'mark_email_read' };
    case 'failed':
      return { text: 'E-Mail fehlgeschlagen', cls: 'bg-red-100 text-red-800 border-red-200', icon: 'error' };
    case 'skipped':
      return { text: 'Keine E-Mail (WhatsApp nutzen)', cls: 'bg-amber-100 text-amber-900 border-amber-200', icon: 'mail_lock' };
    default:
      return { text: 'Noch keine Benachrichtigung', cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'mail' };
  }
}

function phoneToWa(phone?: string | null): string | null {
  if (!phone) return null;
  let n = String(phone).replace(/\D/g, '');
  if (!n) return null;
  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith('0')) n = '49' + n.slice(1);
  if (n.length < 8) return null;
  return n;
}

function buildWaUrl(apt: NotifyFields, kind: 'booking' | 'confirmed' | 'cancelled'): string | null {
  const digits = phoneToWa(apt.client?.phone);
  if (!digits) return null;
  const name = [apt.client?.firstName, apt.client?.lastName].filter(Boolean).join(' ') || '';
  const pet = apt.pet?.name || 'Hund';
  const when = apt.date
    ? new Date(String(apt.date)).toLocaleString('de-DE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
  let msg = `Hallo ${name}! Termin bei Glanz & Groom: ${when}, ${pet}.`;
  if (kind === 'confirmed') {
    msg = `Hallo ${name}! Ihr Termin bei Glanz & Groom am ${when} für ${pet} ist bestätigt. Wir freuen uns! 🐾`;
  } else if (kind === 'cancelled') {
    msg = `Hallo ${name}, Ihr Termin bei Glanz & Groom am ${when} wurde storniert.`;
  } else {
    msg = `Hallo ${name}! Vielen Dank für Ihre Buchung bei Glanz & Groom. Termin: ${when}, ${pet}. Bei Fragen melden Sie sich gerne.`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

/**
 * Admin panel: e-mail send status + resend + free WhatsApp deep-link.
 * WhatsApp Business API can be plugged in later without changing this UI contract.
 */
export default function ClientNotifyPanel({
  apt,
  onUpdated,
}: {
  apt: NotifyFields;
  onUpdated?: (next: Record<string, unknown>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [localStatus, setLocalStatus] = useState(String(apt.clientNotifyStatus || ''));
  const [localDetail, setLocalDetail] = useState(String(apt.clientNotifyDetail || ''));
  const [localAt, setLocalAt] = useState(apt.clientNotifyAt ? String(apt.clientNotifyAt) : '');
  const [lastError, setLastError] = useState('');

  // Reset when opening another appointment / server updates notify fields
  useEffect(() => {
    setLocalStatus(String(apt.clientNotifyStatus || ''));
    setLocalDetail(String(apt.clientNotifyDetail || ''));
    setLocalAt(apt.clientNotifyAt ? String(apt.clientNotifyAt) : '');
    setLastError('');
  }, [apt.id, apt.clientNotifyStatus, apt.clientNotifyDetail, apt.clientNotifyAt]);

  const badge = statusLabel(localStatus || apt.clientNotifyStatus);
  const aptStatus = String(apt.status || 'pending');
  const kind: 'booking' | 'confirmed' | 'cancelled' =
    aptStatus === 'cancelled' ? 'cancelled' : aptStatus === 'confirmed' ? 'confirmed' : 'booking';
  const waUrl = buildWaUrl(apt, kind);
  const hasPhone = Boolean(phoneToWa(apt.client?.phone));
  const hasEmail = Boolean(apt.client?.email && !String(apt.client.email).includes('no-email') && !String(apt.client.email).includes('@local'));

  const resend = async () => {
    setBusy(true);
    setLastError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API}/appointments/${apt.id}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLastError(data.error || 'Fehler beim Senden');
        return;
      }
      const n = data.notify || {};
      setLocalStatus(String(n.status || ''));
      setLocalDetail(String(n.detail || ''));
      setLocalAt(String(n.at || new Date().toISOString()));
      if (data.appointment && onUpdated) onUpdated(data.appointment);
      if (n.status === 'failed') setLastError(String(n.detail || 'E-Mail fehlgeschlagen'));
    } catch {
      setLastError('Netzwerkfehler');
    } finally {
      setBusy(false);
    }
  };

  const detail = localDetail || apt.clientNotifyDetail;
  const at = localAt || apt.clientNotifyAt;

  return (
    <div className="bg-surface-container-low rounded-2xl p-4 space-y-3 border border-outline-variant">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
            Kunden-Benachrichtigung
          </p>
          <p className="font-sans text-label-sm text-on-surface-variant mt-0.5">
            E-Mail jetzt · WhatsApp (manuell) · API später
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.cls}`}
        >
          <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
          {badge.text}
        </span>
      </div>

      {detail ? (
        <p className="font-sans text-sm text-on-surface leading-snug">{String(detail)}</p>
      ) : null}
      {at ? (
        <p className="font-sans text-xs text-on-surface-variant">
          Zuletzt: {new Date(String(at)).toLocaleString('de-DE')}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !hasEmail}
          onClick={resend}
          title={!hasEmail ? 'Keine gültige E-Mail-Adresse' : 'E-Mail erneut senden'}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-blue-600 text-white text-sm font-medium disabled:opacity-40 active:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">
            {busy ? 'progress_activity' : 'send'}
          </span>
          {busy ? 'Sende…' : 'E-Mail senden'}
        </button>

        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-[#25D366] text-white text-sm font-medium active:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-gray-200 text-gray-500 text-sm font-medium"
          >
            Keine Tel.-Nr.
          </button>
        )}
      </div>

      {!hasEmail && hasPhone && (
        <p className="font-sans text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
          Keine E-Mail — bestätigen Sie den Termin per WhatsApp mit einem Tippen.
        </p>
      )}
      {lastError && (
        <p className="font-sans text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{lastError}</p>
      )}
    </div>
  );
}
