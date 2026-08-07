import { isMailConfigured, isRealEmail, salonContact, sendMail } from './mail';
import prisma from '../lib/prisma';

export type ClientNotifyStatus = 'sent' | 'failed' | 'skipped' | 'none';

export type ClientNotifyResult = {
  status: ClientNotifyStatus;
  channel: 'email' | 'whatsapp' | 'none';
  detail: string;
  at: string; // ISO
  /** Prefilled chat for admin → client (free wa.me) */
  clientWhatsAppUrl: string | null;
  smtpConfigured: boolean;
};

/**
 * Await a notify promise, but never hang the request forever (Netlify ~10s limit).
 */
export async function safeNotify<T>(
  label: string,
  work: () => Promise<T>,
  timeoutMs = 8000
): Promise<T | null> {
  try {
    let timedOut = false;
    const result = await Promise.race([
      work(),
      new Promise<null>(resolve => {
        setTimeout(() => {
          timedOut = true;
          resolve(null);
        }, timeoutMs);
      }),
    ]);
    if (timedOut) console.warn(`[bookingNotify] ${label}: timed out after ${timeoutMs}ms`);
    return result as T | null;
  } catch (e) {
    console.error(`[bookingNotify] ${label}:`, e);
    return null;
  }
}

/** Normalize phone to international digits for wa.me (DE-friendly). */
export function phoneToWhatsAppDigits(phone?: string | null): string | null {
  if (!phone) return null;
  let n = String(phone).replace(/\D/g, '');
  if (!n) return null;
  if (n.startsWith('00')) n = n.slice(2);
  // German local: 0… → 49…
  if (n.startsWith('0')) n = '49' + n.slice(1);
  if (n.length < 8) return null;
  return n;
}

export async function persistClientNotify(
  appointmentId: number | string,
  result: Pick<ClientNotifyResult, 'status' | 'channel' | 'detail'>
): Promise<void> {
  try {
    await prisma.appointment.update({
      where: { id: Number(appointmentId) },
      data: {
        clientNotifyStatus: result.status,
        clientNotifyChannel: result.channel === 'none' ? null : result.channel,
        clientNotifyAt: new Date(),
        clientNotifyDetail: result.detail.slice(0, 500),
      },
    });
  } catch (e) {
    // Columns may not exist until db push — never break booking
    console.error('[bookingNotify] persist failed (run prisma db push?):', e);
  }
}

type AptService = {
  price?: number;
  service?: { name?: string | null; nameDe?: string | null; nameUk?: string | null } | null;
};

export type NotifyAppointment = {
  id: number | string;
  date: Date | string;
  duration?: number | null;
  totalPrice?: number | null;
  status?: string | null;
  notes?: string | null;
  client?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  pet?: {
    name?: string | null;
    breed?: string | null;
    size?: string | null;
  } | null;
  groomer?: { name?: string | null } | null;
  services?: AptService[] | null;
};

function fmtDateTimeDe(d: Date): string {
  return d.toLocaleString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtTimeDe(d: Date): string {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function serviceLines(apt: NotifyAppointment): string {
  const list = apt.services || [];
  if (!list.length) return '—';
  return list
    .map(s => {
      const name = s.service?.nameDe || s.service?.name || s.service?.nameUk || 'Leistung';
      const price = s.price != null ? ` (${s.price}€)` : '';
      return `• ${name}${price}`;
    })
    .join('\n');
}

function serviceLinesHtml(apt: NotifyAppointment): string {
  const list = apt.services || [];
  if (!list.length) return '—';
  return list
    .map(s => {
      const name = s.service?.nameDe || s.service?.name || s.service?.nameUk || 'Leistung';
      const price = s.price != null ? ` <strong>${s.price}€</strong>` : '';
      return `<li>${escapeHtml(name)}${price}</li>`;
    })
    .join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function startEnd(apt: NotifyAppointment): { start: Date; end: Date } {
  const start = new Date(apt.date);
  const duration = Math.max(Number(apt.duration) || 60, 15);
  const end = new Date(start.getTime() + duration * 60_000);
  return { start, end };
}

/** Free WhatsApp deep-link (admin → client). Auto WhatsApp API can reuse this message later. */
export function buildClientWhatsAppUrl(
  apt: NotifyAppointment,
  kind: 'booking' | 'confirmed' | 'cancelled' | 'reminder' = 'booking'
): string | null {
  const digits = phoneToWhatsAppDigits(apt.client?.phone);
  if (!digits) return null;
  const salon = salonContact();
  const { start } = startEnd(apt);
  const clientName = [apt.client?.firstName, apt.client?.lastName].filter(Boolean).join(' ') || '';
  const pet = apt.pet?.name || 'Hund';
  const when = fmtDateTimeDe(start);

  let msg = '';
  if (kind === 'confirmed') {
    msg = `Hallo ${clientName}! Ihr Termin bei ${salon.name} am ${when} für ${pet} ist bestätigt. Wir freuen uns auf Sie! 🐾`;
  } else if (kind === 'cancelled') {
    msg = `Hallo ${clientName}, Ihr Termin bei ${salon.name} am ${when} wurde storniert. Für einen neuen Termin melden Sie sich gerne.`;
  } else if (kind === 'reminder') {
    msg = `Hallo ${clientName}! Erinnerung: Termin bei ${salon.name} am ${when} für ${pet}. Bis bald!`;
  } else {
    msg = `Hallo ${clientName}! Vielen Dank für Ihre Buchung bei ${salon.name}. Termin: ${when}, ${pet}. Bei Fragen schreiben Sie uns gerne.`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

function emptyNotify(detail: string, apt: NotifyAppointment, channel: ClientNotifyResult['channel'] = 'none'): ClientNotifyResult {
  return {
    status: 'skipped',
    channel,
    detail,
    at: new Date().toISOString(),
    clientWhatsAppUrl: buildClientWhatsAppUrl(apt),
    smtpConfigured: isMailConfigured(),
  };
}

/** Minimal ICS for calendar apps (Outlook, Google, Apple). */
export function buildIcs(apt: NotifyAppointment): string {
  const salon = salonContact();
  const { start, end } = startEnd(apt);
  const pad = (n: number) => String(n).padStart(2, '0');
  const toUtc = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const petName = apt.pet?.name || 'Hund';
  const clientName = [apt.client?.firstName, apt.client?.lastName].filter(Boolean).join(' ') || 'Kunde';
  const summary = `Grooming: ${petName} – ${salon.name}`;
  const description = [
    `Kunde: ${clientName}`,
    `Tier: ${petName}${apt.pet?.breed ? ` (${apt.pet.breed})` : ''}`,
    `Telefon: ${apt.client?.phone || '—'}`,
    `Leistungen:\n${serviceLines(apt)}`,
    apt.notes ? `Hinweise: ${apt.notes}` : '',
  ]
    .filter(Boolean)
    .join('\\n');

  const uid = `apt-${apt.id}@glanzgroom`;
  const stamp = toUtc(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Glanz & Groom//Booking//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toUtc(start)}`,
    `DTEND:${toUtc(end)}`,
    `SUMMARY:${summary.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${salon.address.replace(/,/g, '\\,')}`,
    `ORGANIZER;CN=${salon.name}:mailto:${salon.email}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

function shellHtml(title: string, bodyHtml: string): string {
  const salon = salonContact();
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f6f4f1;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4f1;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:#ae2f34;color:#fff;padding:20px 24px;">
          <div style="font-size:20px;font-weight:700;">${escapeHtml(salon.name)}</div>
          <div style="font-size:13px;opacity:0.9;margin-top:4px;">Hundesalon · Berlin</div>
        </td></tr>
        <tr><td style="padding:24px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 24px 24px;border-top:1px solid #eee;font-size:12px;color:#666;line-height:1.5;">
          ${escapeHtml(salon.name)} · ${escapeHtml(salon.address)}<br/>
          Tel: <a href="tel:${escapeHtml(salon.phone)}" style="color:#ae2f34;text-decoration:none;">${escapeHtml(salon.phone)}</a>
          · <a href="mailto:${escapeHtml(salon.email)}" style="color:#ae2f34;text-decoration:none;">${escapeHtml(salon.email)}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailsBlock(apt: NotifyAppointment): { text: string; html: string } {
  const salon = salonContact();
  const { start, end } = startEnd(apt);
  const clientName = [apt.client?.firstName, apt.client?.lastName].filter(Boolean).join(' ') || 'Kunde';
  const pet = apt.pet?.name || '—';
  const breed = apt.pet?.breed ? ` (${apt.pet.breed})` : '';
  const size = apt.pet?.size ? `, ${String(apt.pet.size).toUpperCase()}` : '';
  const duration = Math.max(Number(apt.duration) || 60, 15);
  const price = apt.totalPrice != null ? `${apt.totalPrice}€` : '—';
  const groomer = apt.groomer?.name || '—';

  const text = [
    `Termin: ${fmtDateTimeDe(start)}`,
    `Ende ca.: ${fmtTimeDe(end)} (${duration} Min.)`,
    `Kunde: ${clientName}`,
    `Telefon: ${apt.client?.phone || '—'}`,
    `E-Mail: ${apt.client?.email || '—'}`,
    `Tier: ${pet}${breed}${size}`,
    `Groomer: ${groomer}`,
    `Leistungen:\n${serviceLines(apt)}`,
    `Preis (ca.): ${price}`,
    apt.notes ? `Hinweise: ${apt.notes}` : '',
    '',
    `Adresse: ${salon.address}`,
    `Tel: ${salon.phone}`,
  ]
    .filter(line => line !== undefined)
    .join('\n');

  const html = `
    <table role="presentation" width="100%" style="font-size:14px;line-height:1.55;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#666;">Termin</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(fmtDateTimeDe(start))}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Ende ca.</td><td style="padding:6px 0;">${escapeHtml(fmtTimeDe(end))} (${duration} Min.)</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Kunde</td><td style="padding:6px 0;">${escapeHtml(clientName)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Telefon</td><td style="padding:6px 0;"><a href="tel:${escapeHtml(apt.client?.phone || '')}" style="color:#ae2f34;text-decoration:none;">${escapeHtml(apt.client?.phone || '—')}</a></td></tr>
      <tr><td style="padding:6px 0;color:#666;">Tier</td><td style="padding:6px 0;">${escapeHtml(pet + breed + size)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Groomer</td><td style="padding:6px 0;">${escapeHtml(groomer)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Leistungen</td><td style="padding:6px 0;"><ul style="margin:0;padding-left:18px;">${serviceLinesHtml(apt)}</ul></td></tr>
      <tr><td style="padding:6px 0;color:#666;">Preis (ca.)</td><td style="padding:6px 0;font-weight:700;color:#ae2f34;">${escapeHtml(price)}</td></tr>
      ${apt.notes ? `<tr><td style="padding:6px 0;color:#666;">Hinweise</td><td style="padding:6px 0;">${escapeHtml(String(apt.notes))}</td></tr>` : ''}
    </table>`;

  return { text, html };
}

/**
 * After online booking: e-mail client + notify salon.
 * Returns client notify result for admin UI (and persists on the appointment).
 */
export async function notifyBookingCreated(
  apt: NotifyAppointment,
  opts?: { skipSalon?: boolean }
): Promise<ClientNotifyResult> {
  const salon = salonContact();
  const clientEmail = apt.client?.email;
  const clientName = [apt.client?.firstName, apt.client?.lastName].filter(Boolean).join(' ') || 'Kunde';
  const { start } = startEnd(apt);
  const details = detailsBlock(apt);
  const clientWa = buildClientWhatsAppUrl(apt, 'booking');
  const waUrl = `https://wa.me/${salon.whatsapp}?text=${encodeURIComponent(
    `Hallo ${salon.name}! Ich habe einen Termin am ${fmtDateTimeDe(start)} für ${apt.pet?.name || 'meinen Hund'} gebucht.`
  )}`;

  let result: ClientNotifyResult;

  if (!isMailConfigured()) {
    result = {
      status: 'failed',
      channel: 'email',
      detail: 'SMTP nicht konfiguriert (SMTP_HOST/USER/PASS fehlen)',
      at: new Date().toISOString(),
      clientWhatsAppUrl: clientWa,
      smtpConfigured: false,
    };
  } else if (!isRealEmail(clientEmail)) {
    result = {
      status: 'skipped',
      channel: 'email',
      detail: 'Keine gültige Kunden-E-Mail — WhatsApp nutzen',
      at: new Date().toISOString(),
      clientWhatsAppUrl: clientWa,
      smtpConfigured: true,
    };
  } else {
    const subject = `Terminreservierung bei ${salon.name} – ${fmtDateTimeDe(start)}`;
    const text = [
      `Hallo ${clientName},`,
      '',
      `vielen Dank für Ihre Online-Buchung bei ${salon.name}!`,
      'Ihr Termin ist verbindlich reserviert.',
      '',
      details.text,
      '',
      'Bitte erscheinen Sie pünktlich. Absagen bitte mindestens 24 Stunden vorher.',
      '',
      `Fragen? WhatsApp: ${waUrl}`,
      `Telefon: ${salon.phone}`,
      '',
      'Im Anhang finden Sie eine Kalenderdatei (.ics).',
      '',
      `Ihr Team von ${salon.name}`,
    ].join('\n');

    const html = shellHtml(
      subject,
      `
      <p style="margin:0 0 12px;font-size:16px;">Hallo <strong>${escapeHtml(clientName)}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">
        vielen Dank für Ihre Online-Buchung bei <strong>${escapeHtml(salon.name)}</strong>!<br/>
        Ihr Termin ist <strong>verbindlich reserviert</strong>.
      </p>
      <div style="background:#f6f4f1;border-radius:12px;padding:16px;margin:0 0 16px;">
        ${details.html}
      </div>
      <p style="margin:0 0 16px;font-size:13px;color:#555;line-height:1.5;">
        Bitte erscheinen Sie pünktlich. Absagen bitte mindestens 24&nbsp;Stunden vorher.
      </p>
      <p style="margin:0 0 8px;">
        <a href="${waUrl}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;font-size:14px;">
          WhatsApp an den Salon
        </a>
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#666;">Im Anhang: Kalenderdatei (.ics) zum Speichern im Kalender.</p>
      `
    );

    const send = await sendMail({
      to: clientEmail!,
      subject,
      text,
      html,
      replyTo: salon.email,
      attachments: [
        {
          filename: `termin-${apt.id}.ics`,
          content: buildIcs(apt),
          contentType: 'text/calendar; charset=utf-8',
        },
      ],
    });

    result = send.ok
      ? {
          status: 'sent',
          channel: 'email',
          detail: `E-Mail gesendet an ${clientEmail}`,
          at: new Date().toISOString(),
          clientWhatsAppUrl: clientWa,
          smtpConfigured: true,
        }
      : {
          status: 'failed',
          channel: 'email',
          detail: `E-Mail fehlgeschlagen: ${send.error || 'unbekannt'}`,
          at: new Date().toISOString(),
          clientWhatsAppUrl: clientWa,
          smtpConfigured: true,
        };
  }

  // Salon / admin notification (best effort; skip on manual resend)
  if (!opts?.skipSalon && isMailConfigured() && isRealEmail(salon.email)) {
    const subject = `Neue Online-Buchung #${apt.id} – ${clientName} / ${apt.pet?.name || 'Hund'}`;
    const text = [
      `Neue Terminbuchung über die Website.`,
      '',
      details.text,
      '',
      `Kunden-E-Mail Status: ${result.status} — ${result.detail}`,
      clientWa ? `WhatsApp Kunde: ${clientWa}` : 'WhatsApp: keine Nummer',
      '',
      'Status: pending (reserviert – bitte im Admin-Panel prüfen)',
    ].join('\n');

    const html = shellHtml(
      subject,
      `
      <p style="margin:0 0 12px;font-size:15px;"><strong>Neue Online-Buchung</strong> (#${escapeHtml(String(apt.id))})</p>
      <div style="background:#fff4ce;border-radius:12px;padding:16px;margin:0 0 12px;">
        ${details.html}
      </div>
      <p style="margin:0 0 8px;font-size:13px;">Kunden-Benachrichtigung: <strong>${escapeHtml(result.status)}</strong> — ${escapeHtml(result.detail)}</p>
      ${clientWa ? `<p style="margin:0 0 8px;"><a href="${clientWa}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:600;font-size:13px;">WhatsApp an Kunden</a></p>` : ''}
      <p style="margin:0;font-size:13px;color:#666;">Status: <strong>pending</strong> – bitte im Admin-Kalender prüfen.</p>
      `
    );

    await sendMail({
      to: salon.email,
      subject,
      text,
      html,
      replyTo: isRealEmail(clientEmail) ? clientEmail! : undefined,
    });
  }

  await persistClientNotify(apt.id, result);
  return result;
}

/**
 * When staff confirms or cancels — notify client by e-mail.
 */
export async function notifyStatusChange(
  apt: NotifyAppointment,
  newStatus: string,
  previousStatus?: string | null
): Promise<ClientNotifyResult | null> {
  if (previousStatus && previousStatus === newStatus) return null;
  if (newStatus !== 'confirmed' && newStatus !== 'cancelled') return null;

  const clientEmail = apt.client?.email;
  const salon = salonContact();
  const clientName = [apt.client?.firstName, apt.client?.lastName].filter(Boolean).join(' ') || 'Kunde';
  const { start } = startEnd(apt);
  const details = detailsBlock(apt);
  const kind = newStatus === 'confirmed' ? 'confirmed' : 'cancelled';
  const clientWa = buildClientWhatsAppUrl(apt, kind);

  if (!isMailConfigured()) {
    const result: ClientNotifyResult = {
      status: 'failed',
      channel: 'email',
      detail: 'SMTP nicht konfiguriert',
      at: new Date().toISOString(),
      clientWhatsAppUrl: clientWa,
      smtpConfigured: false,
    };
    await persistClientNotify(apt.id, result);
    return result;
  }

  if (!isRealEmail(clientEmail)) {
    const result: ClientNotifyResult = {
      status: 'skipped',
      channel: 'email',
      detail: 'Keine gültige Kunden-E-Mail — WhatsApp nutzen',
      at: new Date().toISOString(),
      clientWhatsAppUrl: clientWa,
      smtpConfigured: true,
    };
    await persistClientNotify(apt.id, result);
    return result;
  }

  if (newStatus === 'confirmed') {
    const subject = `Termin bestätigt – ${salon.name}, ${fmtDateTimeDe(start)}`;
    const text = [
      `Hallo ${clientName},`,
      '',
      `Ihr Termin bei ${salon.name} wurde bestätigt.`,
      '',
      details.text,
      '',
      `Wir freuen uns auf Sie und ${apt.pet?.name || 'Ihren Hund'}!`,
      '',
      `Tel: ${salon.phone}`,
    ].join('\n');

    const html = shellHtml(
      subject,
      `
      <p style="margin:0 0 12px;font-size:16px;">Hallo <strong>${escapeHtml(clientName)}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;">Ihr Termin bei <strong>${escapeHtml(salon.name)}</strong> wurde <span style="color:#0a7;font-weight:700;">bestätigt</span>.</p>
      <div style="background:#e8f5e9;border-radius:12px;padding:16px;margin:0 0 16px;">${details.html}</div>
      <p style="margin:0;font-size:14px;">Wir freuen uns auf Sie und <strong>${escapeHtml(apt.pet?.name || 'Ihren Hund')}</strong>!</p>
      `
    );

    const send = await sendMail({
      to: clientEmail!,
      subject,
      text,
      html,
      replyTo: salon.email,
      attachments: [
        {
          filename: `termin-${apt.id}.ics`,
          content: buildIcs(apt),
          contentType: 'text/calendar; charset=utf-8',
        },
      ],
    });

    const result: ClientNotifyResult = send.ok
      ? {
          status: 'sent',
          channel: 'email',
          detail: `Bestätigung gesendet an ${clientEmail}`,
          at: new Date().toISOString(),
          clientWhatsAppUrl: clientWa,
          smtpConfigured: true,
        }
      : {
          status: 'failed',
          channel: 'email',
          detail: `Bestätigung fehlgeschlagen: ${send.error || 'unbekannt'}`,
          at: new Date().toISOString(),
          clientWhatsAppUrl: clientWa,
          smtpConfigured: true,
        };
    await persistClientNotify(apt.id, result);
    return result;
  }

  // cancelled
  const subject = `Termin storniert – ${salon.name}`;
  const text = [
    `Hallo ${clientName},`,
    '',
    `Ihr Termin bei ${salon.name} am ${fmtDateTimeDe(start)} wurde storniert.`,
    '',
    'Falls Sie einen neuen Termin wünschen, buchen Sie gerne erneut online oder kontaktieren Sie uns.',
    '',
    `Tel: ${salon.phone}`,
    `E-Mail: ${salon.email}`,
  ].join('\n');

  const html = shellHtml(
    subject,
    `
      <p style="margin:0 0 12px;font-size:16px;">Hallo <strong>${escapeHtml(clientName)}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;">
        Ihr Termin am <strong>${escapeHtml(fmtDateTimeDe(start))}</strong> wurde <span style="color:#c62828;font-weight:700;">storniert</span>.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.5;">
        Für einen neuen Termin buchen Sie gerne erneut online oder rufen Sie uns an:<br/>
        <a href="tel:${escapeHtml(salon.phone)}" style="color:#ae2f34;">${escapeHtml(salon.phone)}</a>
      </p>
      `
  );

  const send = await sendMail({
    to: clientEmail!,
    subject,
    text,
    html,
    replyTo: salon.email,
  });

  const result: ClientNotifyResult = send.ok
    ? {
        status: 'sent',
        channel: 'email',
        detail: `Storno-Mail gesendet an ${clientEmail}`,
        at: new Date().toISOString(),
        clientWhatsAppUrl: clientWa,
        smtpConfigured: true,
      }
    : {
        status: 'failed',
        channel: 'email',
        detail: `Storno-Mail fehlgeschlagen: ${send.error || 'unbekannt'}`,
        at: new Date().toISOString(),
        clientWhatsAppUrl: clientWa,
        smtpConfigured: true,
      };
  await persistClientNotify(apt.id, result);
  return result;
}

/** Manual resend from admin: booking | confirmed | cancelled */
export async function resendClientNotify(
  apt: NotifyAppointment,
  kind: 'booking' | 'confirmed' | 'cancelled' = 'booking'
): Promise<ClientNotifyResult> {
  if (kind === 'booking') return notifyBookingCreated(apt, { skipSalon: true });
  return (
    (await notifyStatusChange(apt, kind === 'confirmed' ? 'confirmed' : 'cancelled', null)) ||
    emptyNotify('Nichts zu senden', apt, 'email')
  );
}

/** Contact form → salon inbox */
export async function notifyContactMessage(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<void> {
  const salon = salonContact();
  if (!isRealEmail(salon.email)) return;

  const subject = data.subject
    ? `Kontaktformular: ${data.subject}`
    : `Kontaktformular von ${data.name}`;

  const text = [
    `Neue Nachricht über die Website`,
    '',
    `Name: ${data.name}`,
    `E-Mail: ${data.email}`,
    data.subject ? `Betreff: ${data.subject}` : '',
    '',
    data.message,
  ]
    .filter(Boolean)
    .join('\n');

  await sendMail({
    to: salon.email,
    subject,
    text,
    replyTo: isRealEmail(data.email) ? data.email : undefined,
  });
}
