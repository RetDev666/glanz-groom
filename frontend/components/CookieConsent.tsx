import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  acceptAllConsent,
  rejectOptionalConsent,
  createConsent,
  readConsentFromDocument,
  writeConsentCookie,
  notifyConsentChange,
  CONSENT_CHANGE_EVENT,
  type CookieConsentState,
} from '@/lib/cookieConsent';

type Panel = 'banner' | 'settings' | 'hidden';

interface CookieConsentProps {
  /** From settings API — hide auto-banner if admin disabled it */
  bannerEnabled?: boolean;
}

export default function CookieConsent({ bannerEnabled = true }: CookieConsentProps) {
  const [panel, setPanel] = useState<Panel>('hidden');
  const [prefs, setPrefs] = useState({ functional: false, analytics: false, marketing: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = readConsentFromDocument();
    if (existing) {
      setPrefs({
        functional: existing.functional,
        analytics: existing.analytics,
        marketing: existing.marketing,
      });
      setPanel('hidden');
    } else if (bannerEnabled) {
      setPanel('banner');
    } else {
      setPanel('hidden');
    }
    setReady(true);

    const onOpen = () => setPanel('settings');
    window.addEventListener('gg-open-cookie-settings', onOpen);
    return () => window.removeEventListener('gg-open-cookie-settings', onOpen);
  }, [bannerEnabled]);

  const save = useCallback((consent: CookieConsentState) => {
    writeConsentCookie(consent);
    notifyConsentChange(consent);
    setPrefs({
      functional: consent.functional,
      analytics: consent.analytics,
      marketing: consent.marketing,
    });
    setPanel('hidden');
  }, []);

  if (!ready || panel === 'hidden') return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="pointer-events-auto max-w-3xl mx-auto bg-surface-container-lowest border border-surface-variant shadow-2xl rounded-2xl overflow-hidden">
        {panel === 'banner' && (
          <div className="p-5 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl shrink-0">cookie</span>
              <div>
                <h2 id="cookie-consent-title" className="font-display text-lg font-bold text-on-surface mb-1">
                  Cookie-Einstellungen
                </h2>
                <p id="cookie-consent-desc" className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Wir verwenden technisch notwendige Cookies, um die Website zu betreiben.
                  Optionale Cookies (Funktional, Analyse, Marketing) setzen wir nur mit Ihrer Einwilligung
                  gemäß DSGVO und TTDSG. Details finden Sie in unserer{' '}
                  <Link href="/datenschutz" className="text-primary underline underline-offset-2 hover:opacity-80">
                    Datenschutzerklärung
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setPanel('settings')}
                className="px-4 py-2.5 rounded-full border border-outline font-sans text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Einstellungen
              </button>
              <button
                type="button"
                onClick={() => save(rejectOptionalConsent())}
                className="px-4 py-2.5 rounded-full border border-outline font-sans text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={() => save(acceptAllConsent())}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-sans text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        )}

        {panel === 'settings' && (
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                Cookie-Präferenzen
              </h2>
              <button
                type="button"
                onClick={() => setPanel('hidden')}
                className="text-on-surface-variant hover:text-on-surface p-1"
                aria-label="Schließen"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <CategoryRow
                title="Notwendig"
                desc="Erforderlich für Grundfunktionen und Speicherung Ihrer Cookie-Entscheidung. Können nicht deaktiviert werden."
                checked
                locked
              />
              <CategoryRow
                title="Funktional"
                desc="Ermöglichen erweiterte Funktionen (z. B. bevorzugte Einstellungen)."
                checked={prefs.functional}
                onChange={v => setPrefs(p => ({ ...p, functional: v }))}
              />
              <CategoryRow
                title="Analyse"
                desc="Helfen uns zu verstehen, wie die Website genutzt wird (z. B. Google Analytics), nur bei aktiver Konfiguration."
                checked={prefs.analytics}
                onChange={v => setPrefs(p => ({ ...p, analytics: v }))}
              />
              <CategoryRow
                title="Marketing"
                desc="Werden für personalisierte Werbung und Social-Media-Pixel genutzt (z. B. Meta Pixel), nur bei aktiver Konfiguration."
                checked={prefs.marketing}
                onChange={v => setPrefs(p => ({ ...p, marketing: v }))}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => save(rejectOptionalConsent())}
                className="px-4 py-2.5 rounded-full border border-outline font-sans text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Ablehnen
              </button>
              <button
                type="button"
                onClick={() => save(createConsent(prefs))}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-sans text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Auswahl speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  desc,
  checked,
  locked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-variant">
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-semibold text-on-surface">{title}</p>
        <p className="font-sans text-xs text-on-surface-variant mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <label className={`relative inline-flex items-center shrink-0 ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={locked}
          onChange={e => onChange?.(e.target.checked)}
        />
        <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
      </label>
    </div>
  );
}

/** Call from footer / privacy page to re-open settings. */
export function openCookieSettings(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('gg-open-cookie-settings'));
  }
}

/** Load tracking scripts based on consent + admin config. Mount once in Layout. */
export function ConsentAwareTracking({
  googleAnalyticsId,
  metaPixelId,
}: {
  googleAnalyticsId?: string;
  metaPixelId?: string;
}) {
  useEffect(() => {
    const apply = (consent: CookieConsentState | null) => {
      if (!consent) return;
      import('@/lib/cookieConsent').then(mod => {
        if (consent.analytics && googleAnalyticsId) {
          mod.loadGoogleAnalytics(googleAnalyticsId);
        }
        if (consent.marketing && metaPixelId) {
          mod.loadMetaPixel(metaPixelId);
        }
      });
    };

    apply(readConsentFromDocument());

    const handler = (e: Event) => {
      apply((e as CustomEvent<CookieConsentState>).detail);
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, handler);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
  }, [googleAnalyticsId, metaPixelId]);

  return null;
}
