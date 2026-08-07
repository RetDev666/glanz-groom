/** Default Impressum / legal data (overridable via admin settings). */
export const LEGAL_DEFAULTS = {
  ownerName: 'Alexander Markus',
  businessName: 'Glanz & Groom',
  legalForm: 'Einzelunternehmen',
  address: 'Kreuznacher Str. 10\n14197 Berlin\nDeutschland',
  phone: '+49 30 75630831',
  email: 'glanz.groom@gmail.com',
  /** Leave empty to omit from Impressum */
  ustId: '',
  /** Wirtschafts-Identifikationsnummer — leave empty to omit */
  wIdNr: '',
  mapsUrl: 'https://maps.app.goo.gl/NDd5SztVC6zd6C9i7?g_st=it',
  instagramUrl: 'https://www.instagram.com/glanz_groom',
  instagramHandle: '@glanz_groom',
  hostingProvider: 'Netlify, Inc.',
  hostingAddress: '512 2nd Street, Suite 200, San Francisco, CA 94107, USA',
  hostingUrl: 'https://www.netlify.com',
};

export type LegalSettings = {
  ownerName: string;
  businessName: string;
  legalForm: string;
  address: string;
  phone: string;
  email: string;
  ustId: string;
  wIdNr: string;
  mapsUrl: string;
  instagramUrl: string;
  instagramHandle: string;
  hostingProvider: string;
  hostingAddress: string;
  hostingUrl: string;
  googleAnalyticsId: string;
  metaPixelId: string;
  cookieBannerEnabled: boolean;
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
};

export function mergeLegalSettings(raw: Record<string, string> = {}): LegalSettings {
  return {
    ownerName: raw.legalOwnerName || LEGAL_DEFAULTS.ownerName,
    businessName: raw.legalBusinessName || raw.name || LEGAL_DEFAULTS.businessName,
    legalForm: raw.legalForm || LEGAL_DEFAULTS.legalForm,
    address: raw.legalAddress || raw.address || LEGAL_DEFAULTS.address,
    phone: raw.legalPhone || raw.phone || LEGAL_DEFAULTS.phone,
    email: raw.legalEmail || raw.email || LEGAL_DEFAULTS.email,
    ustId: (raw.legalUstId || '').trim(),
    wIdNr: (raw.legalWIdNr || '').trim(),
    mapsUrl: raw.mapsUrl || LEGAL_DEFAULTS.mapsUrl,
    instagramUrl: raw.instagram || raw.instagramUrl || LEGAL_DEFAULTS.instagramUrl,
    instagramHandle: raw.instagramHandle || LEGAL_DEFAULTS.instagramHandle,
    hostingProvider: raw.hostingProvider || LEGAL_DEFAULTS.hostingProvider,
    hostingAddress: raw.hostingAddress || LEGAL_DEFAULTS.hostingAddress,
    hostingUrl: raw.hostingUrl || LEGAL_DEFAULTS.hostingUrl,
    googleAnalyticsId: (raw.googleAnalyticsId || '').trim(),
    metaPixelId: (raw.metaPixelId || '').trim(),
    cookieBannerEnabled: raw.cookieBannerEnabled !== 'false',
    analyticsEnabled: raw.cookieAnalyticsEnabled === 'true',
    marketingEnabled: raw.cookieMarketingEnabled === 'true',
  };
}

/** Shared fetch for legal/public pages */
export async function fetchSettingsObject(): Promise<Record<string, string>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://glanz-groom.netlify.app/api';
    const res = await fetch(`${apiUrl}/settings`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}
