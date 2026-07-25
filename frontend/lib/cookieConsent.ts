/**
 * GDPR-compliant cookie consent utilities.
 * Stores consent in a first-party cookie with security flags.
 */

export const CONSENT_COOKIE_NAME = 'gg_cookie_consent';
export const CONSENT_VERSION = 1;
/** Max age: 1 year */
export const CONSENT_MAX_AGE = 365 * 24 * 60 * 60;

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsentState {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  version: number;
  /** Unix timestamp (seconds) when consent was given */
  ts: number;
}

export const DEFAULT_CONSENT: CookieConsentState = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  ts: 0,
};

export function createConsent(
  partial: Partial<Pick<CookieConsentState, 'functional' | 'analytics' | 'marketing'>>
): CookieConsentState {
  return {
    necessary: true,
    functional: !!partial.functional,
    analytics: !!partial.analytics,
    marketing: !!partial.marketing,
    version: CONSENT_VERSION,
    ts: Math.floor(Date.now() / 1000),
  };
}

export function acceptAllConsent(): CookieConsentState {
  return createConsent({ functional: true, analytics: true, marketing: true });
}

export function rejectOptionalConsent(): CookieConsentState {
  return createConsent({ functional: false, analytics: false, marketing: false });
}

/** Parse consent cookie value; returns null if missing/invalid/outdated. */
export function parseConsent(raw: string | null | undefined): CookieConsentState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsentState>;
    if (
      typeof data !== 'object' ||
      data === null ||
      data.necessary !== true ||
      typeof data.version !== 'number' ||
      data.version < CONSENT_VERSION
    ) {
      return null;
    }
    return {
      necessary: true,
      functional: !!data.functional,
      analytics: !!data.analytics,
      marketing: !!data.marketing,
      version: data.version,
      ts: typeof data.ts === 'number' ? data.ts : 0,
    };
  } catch {
    return null;
  }
}

export function readConsentFromDocument(): CookieConsentState | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.slice(CONSENT_COOKIE_NAME.length + 1);
  return parseConsent(value);
}

/**
 * Write consent cookie with security attributes:
 * - SameSite=Lax (CSRF mitigation, allows top-level navigation)
 * - Secure when served over HTTPS
 * - Path=/
 * - Max-Age set
 * Note: HttpOnly cannot be set from JavaScript (by design for consent UI).
 */
export function writeConsentCookie(consent: CookieConsentState): void {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(consent));
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearConsentCookie(): void {
  if (typeof document === 'undefined') return;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function hasAnalyticsConsent(consent: CookieConsentState | null): boolean {
  return !!consent?.analytics;
}

export function hasMarketingConsent(consent: CookieConsentState | null): boolean {
  return !!consent?.marketing;
}

export function hasFunctionalConsent(consent: CookieConsentState | null): boolean {
  return !!consent?.functional;
}

/** Dispatch so other components can react to consent changes. */
export const CONSENT_CHANGE_EVENT = 'gg-cookie-consent-change';

export function notifyConsentChange(consent: CookieConsentState): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: consent }));
}

/** Load Google Analytics only after analytics consent. */
export function loadGoogleAnalytics(measurementId: string): void {
  if (typeof window === 'undefined' || !measurementId) return;
  if ((window as any).__gg_ga_loaded) return;
  (window as any).__gg_ga_loaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: unknown[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, { anonymize_ip: true });
}

/** Load Meta (Facebook) Pixel only after marketing consent. */
export function loadMetaPixel(pixelId: string): void {
  if (typeof window === 'undefined' || !pixelId) return;
  if ((window as any).__gg_fb_loaded) return;
  (window as any).__gg_fb_loaded = true;

  const f = (window as any).fbq || function (...args: unknown[]) {
    ((window as any).fbq.q = (window as any).fbq.q || []).push(args);
  };
  (window as any).fbq = f;
  if (!(window as any)._fbq) (window as any)._fbq = f;
  f.push = f;
  f.loaded = true;
  f.version = '2.0';
  f.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  f('init', pixelId);
  f('track', 'PageView');
}
