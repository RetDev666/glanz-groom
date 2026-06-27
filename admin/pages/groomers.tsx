import { useEffect, useState, useCallback, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

const PRESET_COLORS = [
  '#f56a6a', '#42b5a9', '#ffc627', '#1a6b3c', '#5c3785',
  '#b35c00', '#1565c0', '#2e7d32', '#6a1b9a', '#c62828',
];

type Groomer = Record<string, unknown>;

function GroomerModal({
  groomer,
  onClose,
  onSave,
}: {
  groomer: Groomer | null;
  onClose: () => void;
  onSave: (data: { name: string; role: string; color: string; photoUrl?: string; id?: number }) => Promise<void>;
}) {
  const { t } = useAdminLang();
  const [name, setName] = useState(String(groomer?.name || ''));
  const [role, setRole] = useState(String(groomer?.role || ''));
  const [color, setColor] = useState(String(groomer?.color || '#f56a6a'));
  const [photoUrl, setPhotoUrl] = useState(String(groomer?.photoUrl || ''));
  const [photoPreview, setPhotoPreview] = useState(String(groomer?.photoUrl || ''));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch(`${API}/upload/groomer-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPhotoUrl(data.url);
        setPhotoPreview(data.url);
      } else {
        alert(data.error || 'Помилка завантаження фото');
      }
    } catch (err: any) {
      alert(err.message || 'Сталася помилка при завантаженні');
    }
    setUploading(false);
    e.target.value = ''; // Reset input so user can pick the same file again
  };

  const handleSave = async () => {
    if (!name || !role) return;
    setSaving(true);
    await onSave({ name, role, color, photoUrl: photoUrl || undefined, id: groomer ? Number(groomer.id) : undefined });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-md border border-outline-variant" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="font-display text-headline-sm text-on-surface">
            {groomer ? t.groomers.editTitle : t.groomers.newTitle}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
            {photoPreview ? (
              <img src={photoPreview} alt={name} className="w-14 h-14 rounded-full object-cover shadow-md shrink-0" />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-white text-xl shadow-md shrink-0"
                style={{ backgroundColor: color }}
              >
                {name.charAt(0) || '?'}
              </div>
            )}
            <div>
              <p className="font-sans text-label-lg text-on-surface">{name || t.groomers.namePlaceholder}</p>
              <p className="font-sans text-label-sm text-on-surface-variant">{role || t.groomers.rolePlaceholder}</p>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block font-sans text-label-sm text-on-surface-variant mb-2">{t.groomers.photoLabel}</label>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 border border-outline rounded-xl px-4 py-2 font-sans text-label-md text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">{uploading ? 'progress_activity' : 'upload'}</span>
                {uploading ? t.uploading : photoPreview ? t.groomers.photoChange : t.groomers.photoUpload}
              </button>
              {photoPreview && (
                <button type="button" onClick={() => { setPhotoUrl(''); setPhotoPreview(''); }} className="text-red-500 font-sans text-label-sm hover:underline">
                  {t.remove}
                </button>
              )}
            </div>
            <p className="font-sans text-body-sm text-on-surface-variant mt-1">{t.groomers.photoTypes}</p>
          </div>

          <div>
            <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.groomers.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.groomers.namePlaceholder}
              className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans"
            />
          </div>

          <div>
            <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.groomers.roleLabel}</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder={t.groomers.rolePlaceholder}
              className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans"
            />
          </div>

          <div>
            <label className="block font-sans text-label-sm text-on-surface-variant mb-2">{t.groomers.colorLabel}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all shadow-sm ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-outline cursor-pointer p-0.5"
              />
              <span className="font-mono text-label-md text-on-surface-variant">{color}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-outline font-sans text-label-lg py-3 rounded-full hover:bg-surface-container-low transition-colors">
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name || !role}
              className="flex-1 bg-primary text-on-primary font-sans text-label-lg py-3 rounded-full hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? t.saving : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GroomersPage() {
  const { t } = useAdminLang();
  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalGroomer, setModalGroomer] = useState<Groomer | null | 'new'>(null);

  const fetchGroomers = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/groomers/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setGroomers(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchGroomers(); }, [fetchGroomers]);

  const handleSave = async (data: { name: string; role: string; color: string; photoUrl?: string; id?: number }) => {
    const token = localStorage.getItem('admin_token');
    const body = { name: data.name, role: data.role, color: data.color, photoUrl: data.photoUrl ?? null };
    if (data.id) {
      await fetch(`${API}/groomers/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`${API}/groomers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
    }
    setModalGroomer(null);
    fetchGroomers();
  };

  const toggleActive = async (id: number, current: boolean) => {
    const token = localStorage.getItem('admin_token');
    if (current) {
      if (!confirm(t.groomers.deactivateConfirm)) return;
      await fetch(`${API}/groomers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    } else {
      await fetch(`${API}/groomers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: true }),
      });
    }
    fetchGroomers();
  };

  return (
    <AdminLayout title={t.groomers.title}>
      {modalGroomer !== null && (
        <GroomerModal
          groomer={modalGroomer === 'new' ? null : modalGroomer}
          onClose={() => setModalGroomer(null)}
          onSave={handleSave}
        />
      )}

      <header className="sticky top-0 bg-surface border-b border-outline-variant flex items-center justify-between px-6 h-16 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-on-surface">{t.groomers.title}</h2>
          <span className="font-sans text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
            {t.groomers.activeCount(groomers.filter(g => g.isActive).length)}
          </span>
        </div>
        <button
          onClick={() => setModalGroomer('new')}
          className="flex items-center gap-2 bg-primary text-on-primary font-sans text-sm font-semibold rounded-full py-2 px-5 hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined fill text-[18px]">person_add</span>
          {t.groomers.addBtn}
        </button>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 font-sans text-on-surface-variant">{t.loading}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groomers.map(g => (
              <div
                key={String(g.id)}
                className={`bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-5 transition-all ${!g.isActive ? 'opacity-50' : 'hover:-translate-y-0.5'}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  {g.photoUrl ? (
                    <img
                      src={String(g.photoUrl)}
                      alt={String(g.name)}
                      className="w-14 h-14 rounded-full object-cover shadow-md shrink-0"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-white text-xl shadow-md shrink-0"
                      style={{ backgroundColor: String(g.color || '#f56a6a') }}
                    >
                      {String(g.name).charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-label-lg text-on-surface font-semibold truncate">{String(g.name)}</p>
                    <p className="font-sans text-label-sm text-on-surface-variant truncate">{String(g.role)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`flex-1 text-center font-sans text-label-sm px-3 py-1 rounded-full ${g.isActive ? 'bg-green-100 text-green-800' : 'bg-surface-container text-on-surface-variant'}`}>
                    {g.isActive ? t.active : t.inactive}
                  </span>
                  <button
                    onClick={() => setModalGroomer(g)}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    title={t.groomers.editTitle2}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => toggleActive(Number(g.id), Boolean(g.isActive))}
                    className={`p-2 rounded-lg transition-colors ${g.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    title={g.isActive ? t.groomers.deactivateTitle : t.groomers.activateTitle}
                  >
                    <span className="material-symbols-outlined text-[18px]">{g.isActive ? 'person_off' : 'person'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
