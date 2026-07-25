import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

interface LegalForm {
  legalOwnerName: string;
  legalBusinessName: string;
  legalForm: string;
  legalAddress: string;
  legalPhone: string;
  legalEmail: string;
  legalUstId: string;
  legalWIdNr: string;
  mapsUrl: string;
  instagram: string;
  cookieBannerEnabled: string;
  cookieAnalyticsEnabled: string;
  cookieMarketingEnabled: string;
  googleAnalyticsId: string;
  metaPixelId: string;
}

const DEFAULTS: LegalForm = {
  legalOwnerName: 'Alexander Markus',
  legalBusinessName: 'Glanz & Groom',
  legalForm: 'Einzelunternehmen',
  legalAddress: 'Kreuznacher Straße 10, 14197 Berlin',
  legalPhone: '+49 176 20331535',
  legalEmail: 'info@glanzgroom.de',
  legalUstId: '',
  legalWIdNr: '',
  mapsUrl: 'https://maps.app.goo.gl/NDd5SztVC6zd6C9i7?g_st=it',
  instagram: 'https://www.instagram.com/glanz_groom',
  cookieBannerEnabled: 'true',
  cookieAnalyticsEnabled: 'false',
  cookieMarketingEnabled: 'false',
  googleAnalyticsId: '',
  metaPixelId: '',
};

const API = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LegalPage() {
  const { t } = useAdminLang();
  const [form, setForm] = useState<LegalForm>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'impressum' | 'cookies'>('impressum');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API()}/settings`);
        if (res.ok) {
          const data = await res.json();
          setForm(prev => {
            const next = { ...prev };
            (Object.keys(prev) as (keyof LegalForm)[]).forEach(key => {
              if (data[key] !== undefined && data[key] !== null) {
                next[key] = String(data[key]);
              }
            });
            // Fallbacks from salon settings if legal-specific empty
            if (!next.legalAddress && data.address) next.legalAddress = data.address;
            if (!next.legalPhone && data.phone) next.legalPhone = data.phone;
            if (!next.legalEmail && data.email) next.legalEmail = data.email;
            if (!next.instagram && data.instagram) next.instagram = data.instagram;
            if (!next.legalBusinessName && data.name) next.legalBusinessName = data.name;
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to load legal settings', err);
      }
      setLoading(false);
    })();
  }, []);

  const setField = (key: keyof LegalForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API()}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save legal settings', err);
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'impressum' as const, label: t.legal.tabImpressum, icon: 'gavel' },
    { id: 'cookies' as const, label: t.legal.tabCookies, icon: 'cookie' },
  ];

  return (
    <AdminLayout title={t.legal.title}>
      <header className="sticky top-0 bg-surface border-b border-outline-variant flex items-center px-6 h-16 shrink-0 z-40">
        <h2 className="font-display text-xl font-bold text-on-surface">{t.legal.title}</h2>
      </header>

      <div className="p-6 max-w-2xl">
        {loading ? (
          <p className="font-sans text-on-surface-variant">{t.loading}</p>
        ) : (
          <>
            <div className="flex gap-2 mb-6 p-1 bg-surface-container-low rounded-full w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-sans text-label-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'impressum' && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-on-surface mb-1">{t.legal.impressumTitle}</h3>
                  <p className="font-sans text-label-sm text-on-surface-variant leading-relaxed">{t.legal.impressumHint}</p>
                </div>

                {(
                  [
                    { key: 'legalOwnerName', label: t.legal.fields.ownerName, icon: 'person' },
                    { key: 'legalBusinessName', label: t.legal.fields.businessName, icon: 'store' },
                    { key: 'legalForm', label: t.legal.fields.legalForm, icon: 'apartment' },
                    { key: 'legalAddress', label: t.legal.fields.address, icon: 'location_on' },
                    { key: 'legalPhone', label: t.legal.fields.phone, icon: 'phone' },
                    { key: 'legalEmail', label: t.legal.fields.email, icon: 'mail' },
                    { key: 'legalUstId', label: t.legal.fields.ustId, icon: 'receipt_long', ph: t.legal.fields.ustIdPh },
                    { key: 'legalWIdNr', label: t.legal.fields.wIdNr, icon: 'badge', ph: t.legal.fields.wIdNrPh },
                    { key: 'mapsUrl', label: t.legal.fields.mapsUrl, icon: 'map' },
                    { key: 'instagram', label: t.legal.fields.instagram, icon: 'photo_camera' },
                  ] as const
                ).map(field => (
                  <div key={field.key}>
                    <label className="block font-sans text-label-sm text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">{field.icon}</span>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={form[field.key]}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={'ph' in field ? field.ph : undefined}
                      className="w-full bg-surface border border-outline rounded-xl px-4 py-3 font-sans text-body-md focus:border-primary focus:ring-1 outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'cookies' && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-on-surface mb-1">{t.legal.cookiesTitle}</h3>
                  <p className="font-sans text-label-sm text-on-surface-variant leading-relaxed">{t.legal.cookiesHint}</p>
                </div>

                <ToggleRow
                  label={t.legal.fields.bannerEnabled}
                  checked={form.cookieBannerEnabled !== 'false'}
                  onChange={v => setField('cookieBannerEnabled', v ? 'true' : 'false')}
                />
                <ToggleRow
                  label={t.legal.fields.analyticsEnabled}
                  checked={form.cookieAnalyticsEnabled === 'true'}
                  onChange={v => setField('cookieAnalyticsEnabled', v ? 'true' : 'false')}
                />
                {form.cookieAnalyticsEnabled === 'true' && (
                  <div>
                    <label className="block font-sans text-label-sm text-on-surface-variant mb-1.5">
                      {t.legal.fields.gaId}
                    </label>
                    <input
                      type="text"
                      value={form.googleAnalyticsId}
                      onChange={e => setField('googleAnalyticsId', e.target.value.trim())}
                      placeholder={t.legal.fields.gaIdPh}
                      className="w-full bg-surface border border-outline rounded-xl px-4 py-3 font-sans text-body-md focus:border-primary focus:ring-1 outline-none font-mono"
                    />
                  </div>
                )}
                <ToggleRow
                  label={t.legal.fields.marketingEnabled}
                  checked={form.cookieMarketingEnabled === 'true'}
                  onChange={v => setField('cookieMarketingEnabled', v ? 'true' : 'false')}
                />
                {form.cookieMarketingEnabled === 'true' && (
                  <div>
                    <label className="block font-sans text-label-sm text-on-surface-variant mb-1.5">
                      {t.legal.fields.pixelId}
                    </label>
                    <input
                      type="text"
                      value={form.metaPixelId}
                      onChange={e => setField('metaPixelId', e.target.value.trim())}
                      placeholder={t.legal.fields.pixelIdPh}
                      className="w-full bg-surface border border-outline rounded-xl px-4 py-3 font-sans text-body-md focus:border-primary focus:ring-1 outline-none font-mono"
                    />
                  </div>
                )}

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="font-sans text-label-sm text-amber-900 flex items-start gap-2 leading-relaxed">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">security</span>
                    {t.legal.securityNote}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-on-primary font-sans text-label-lg px-6 py-3 rounded-full hover:opacity-90 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? t.saving : t.legal.saveBtn}
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-green-700 font-sans text-label-md">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {t.legal.savedMsg}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant cursor-pointer">
      <span className="font-sans text-label-md text-on-surface">{label}</span>
      <div className="relative inline-flex items-center shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-outline-variant peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
      </div>
    </label>
  );
}
