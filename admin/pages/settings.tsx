import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

interface SalonSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  instagram: string;
  facebook: string;
}

const DEFAULT_SETTINGS: SalonSettings = {
  name: 'Glanz & Groom',
  address: 'Musterstraße 12, 10115 Berlin',
  phone: '+49 30 1234567',
  email: 'info@glanzgroom.de',
  openingHours: 'Mo–Fr: 10:00–18:00, Sa: 10:00–15:00',
  instagram: 'https://instagram.com/glanzgroom',
  facebook: '',
};

export default function SettingsPage() {
  const { t } = useAdminLang();
  const [settings, setSettings] = useState<SalonSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'salon' | 'account'>('salon');

  // Password change
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }));
          }
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  const handleChangePassword = async () => {
    setPassError('');
    if (newPass !== confirmPass) {
      setPassError(t.settings.passwordMismatch);
      return;
    }
    if (newPass.length < 6) {
      setPassError(t.settings.passwordTooShort);
      return;
    }
    setPassLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      if (res.ok) {
        setPassSaved(true);
        setOldPass(''); setNewPass(''); setConfirmPass('');
        setTimeout(() => setPassSaved(false), 3000);
      } else {
        const d = await res.json();
        setPassError(d.error || t.settings.changePasswordError);
      }
    } catch {
      setPassError(t.settings.connectionError);
    }
    setPassLoading(false);
  };

  const tabs = [
    { id: 'salon', label: t.settings.tabSalon, icon: 'store' },
    { id: 'account', label: t.settings.tabAccount, icon: 'manage_accounts' },
  ];

  return (
    <AdminLayout title={t.settings.title}>
      <header className="sticky top-0 bg-surface border-b border-outline-variant flex items-center px-6 h-16 shrink-0 z-40">
        <h2 className="font-display text-xl font-bold text-on-surface">{t.settings.title}</h2>
      </header>

      <div className="p-6 max-w-2xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-surface-container-low rounded-full w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'salon' | 'account')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-sans text-label-md transition-all ${activeTab === tab.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Salon Settings */}
        {activeTab === 'salon' && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-on-surface">{t.settings.salonTitle}</h3>

            {[
              { label: t.settings.fields.name, key: 'name', placeholder: 'Glanz & Groom', icon: 'store' },
              { label: t.settings.fields.address, key: 'address', placeholder: 'Musterstraße 12, 10115 Berlin', icon: 'location_on' },
              { label: t.settings.fields.phone, key: 'phone', placeholder: '+49 30 1234567', icon: 'phone' },
              { label: t.settings.fields.email, key: 'email', placeholder: 'info@glanzgroom.de', icon: 'mail' },
              { label: t.settings.fields.openingHours, key: 'openingHours', placeholder: 'Mo–Fr: 10:00–18:00', icon: 'schedule' },
              { label: 'Instagram', key: 'instagram', placeholder: 'https://instagram.com/...', icon: 'photo_camera' },
              { label: 'Facebook', key: 'facebook', placeholder: 'https://facebook.com/...', icon: 'thumb_up' },
            ].map(field => (
              <div key={field.key}>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">{field.icon}</span>
                  {field.label}
                </label>
                <input
                  type="text"
                  value={settings[field.key as keyof SalonSettings]}
                  onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-3 font-sans text-body-md focus:border-primary focus:ring-1 outline-none"
                />
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 bg-primary text-on-primary font-sans text-label-lg px-6 py-3 rounded-full hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {t.settings.saveBtn}
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-green-700 font-sans text-label-md">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {t.settings.savedMsg}
                </span>
              )}
            </div>

            <div className="mt-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
              <p className="font-sans text-label-sm text-on-surface-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5">info</span>
                {t.settings.infoNote}
              </p>
            </div>
          </div>
        )}

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            {/* Admin info */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
              <h3 className="font-display text-lg font-bold text-on-surface mb-4">{t.settings.accountTitle}</h3>
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined fill text-on-primary">admin_panel_settings</span>
                </div>
                <div>
                  <p className="font-sans text-label-lg text-on-surface font-semibold">{t.settings.adminRole}</p>
                  <p className="font-sans text-label-sm text-on-surface-variant">admin@glanzgroom.ua</p>
                </div>
              </div>
            </div>

            {/* Change password */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-on-surface">{t.settings.changePasswordTitle}</h3>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.settings.oldPasswordLabel}</label>
                <input
                  type="password"
                  value={oldPass}
                  onChange={e => setOldPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-3 font-sans focus:border-primary focus:ring-1 outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.settings.newPasswordLabel}</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-3 font-sans focus:border-primary focus:ring-1 outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.settings.confirmPasswordLabel}</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-3 font-sans focus:border-primary focus:ring-1 outline-none"
                />
              </div>
              {passError && (
                <div className="p-3 bg-error-container text-on-error-container rounded-xl font-sans text-sm">{passError}</div>
              )}
              {passSaved && (
                <div className="p-3 bg-green-50 text-green-800 rounded-xl font-sans text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {t.settings.passwordChangedMsg}
                </div>
              )}
              <button
                onClick={handleChangePassword}
                disabled={passLoading || !oldPass || !newPass || !confirmPass}
                className="flex items-center gap-2 bg-primary text-on-primary font-sans text-label-lg px-6 py-3 rounded-full hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {passLoading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">lock_reset</span>}
                {t.settings.changePasswordBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
