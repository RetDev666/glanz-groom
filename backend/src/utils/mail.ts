import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;
let configured: boolean | null = null;

export function isMailConfigured(): boolean {
  if (configured !== null) return configured;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  configured = Boolean(host && user && pass);
  if (!configured) {
    console.warn('[mail] SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS). Emails will be skipped.');
  }
  return configured;
}

function getTransporter(): Transporter | null {
  if (!isMailConfigured()) return null;
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === 'true' ||
    process.env.SMTP_SECURE === '1' ||
    port === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export function isRealEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const e = email.trim().toLowerCase();
  if (!e) return false;
  if (
    e.includes('@local') ||
    e.includes('no-email') ||
    e.endsWith('@example.com') ||
    e.startsWith('block-') ||
    e.startsWith('client-')
  ) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function salonContact() {
  return {
    name: process.env.SALON_NAME || 'Glanz & Groom',
    email:
      process.env.CONTACT_EMAIL ||
      process.env.SALON_EMAIL ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      'glanz.groom@gmail.com',
    phone: process.env.SALON_PHONE || '+49 30 75630831',
    address: process.env.SALON_ADDRESS || 'Kreuznacher Str. 10, 14197 Berlin',
    /** Digits only for wa.me */
    whatsapp: (process.env.SALON_WHATSAPP || '493075630831').replace(/\D/g, ''),
    website: process.env.FRONTEND_URL || 'https://glanzgroom.de',
  };
}

export function fromAddress(): string {
  const salon = salonContact();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || salon.email;
  // "Name <email>" form
  if (from.includes('<')) return from;
  return `${salon.name} <${from}>`;
}

export type MailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType?: string;
};

export type SendMailOptions = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
  /** BCC e.g. salon copy */
  bcc?: string | string[];
};

/**
 * Send email. Never throws to callers — returns { ok, error? }.
 * Safe to fire-and-forget after booking so a mail failure never blocks the API.
 */
export async function sendMail(opts: SendMailOptions): Promise<{ ok: boolean; error?: string }> {
  const transport = getTransporter();
  if (!transport) {
    return { ok: false, error: 'SMTP not configured' };
  }

  const to = Array.isArray(opts.to) ? opts.to.filter(Boolean) : [opts.to];
  if (to.length === 0) {
    return { ok: false, error: 'No recipients' };
  }

  try {
    await transport.sendMail({
      from: fromAddress(),
      to: to.join(', '),
      bcc: opts.bcc,
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
      html: opts.html || opts.text.replace(/\n/g, '<br/>'),
      attachments: opts.attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
    return { ok: true };
  } catch (err: any) {
    console.error('[mail] send failed:', err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}
