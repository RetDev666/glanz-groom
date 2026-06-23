import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState, useCallback } from 'react';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

type Service = Record<string, unknown>;

const EMPTY_SERVICE = {
  name: '', nameUk: '', description: '', category: 'package',
  priceXs: '', priceS: '', priceM: '', priceL: '', priceXl: '',
  durationXs: '', durationS: '', durationM: '', durationL: '', durationXl: '',
};

interface BreedItem {
  name: string;
  img: string;
}

function BreedsConfigModal({ onClose, t }: { onClose: () => void; t: ReturnType<typeof useAdminLang>['t'] }) {
  const [breeds, setBreeds] = useState<Record<string, BreedItem[]>>({
    xs: [], s: [], m: [], l: [], xl: []
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(data => {
        const parsed: Record<string, BreedItem[]> = { xs: [], s: [], m: [], l: [], xl: [] };
        (['xs', 's', 'm', 'l', 'xl'] as const).forEach(sz => {
          const val = data[`breeds_${sz}`];
          if (val) {
            try {
              const arr = JSON.parse(val);
              if (Array.isArray(arr)) parsed[sz] = arr;
              else parsed[sz] = val.split(',').map((n: string) => ({ name: n.trim(), img: '' }));
            } catch {
              parsed[sz] = val.split(',').map((n: string) => ({ name: n.trim(), img: '' }));
            }
          }
        });
        setBreeds(parsed);
      })
      .catch(() => {});
  }, []);

  const handleAdd = (sz: string) => {
    setBreeds(prev => ({ ...prev, [sz]: [...prev[sz], { name: '', img: '' }] }));
  };

  const handleRemove = (sz: string, idx: number) => {
    setBreeds(prev => ({ ...prev, [sz]: prev[sz].filter((_, i) => i !== idx) }));
  };

  const handleChange = (sz: string, idx: number, field: keyof BreedItem, val: string) => {
    setBreeds(prev => {
      const copy = [...prev[sz]];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, [sz]: copy };
    });
  };

  const handlePhotoUpload = async (sizeKey: string, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`${sizeKey}-${index}`);
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('photo', file);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/pet-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        handleChange(sizeKey, index, 'img', data.url);
      } else {
        alert(data.error || 'Помилка завантаження фото');
      }
    } catch (err: any) {
      alert(err.message || 'Сталася помилка при завантаженні');
    }
    setUploading(null);
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      breeds_xs: JSON.stringify(breeds.xs),
      breeds_s: JSON.stringify(breeds.s),
      breeds_m: JSON.stringify(breeds.m),
      breeds_l: JSON.stringify(breeds.l),
      breeds_xl: JSON.stringify(breeds.xl),
    };
    const token = localStorage.getItem('admin_token');
    await fetch(`${API}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-outline-variant flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant shrink-0">
          <h3 className="font-display text-headline-sm text-on-surface">{t.services.breedsTitle}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <p className="font-sans text-body-md text-on-surface-variant">{t.services.breedsDesc}</p>
          {(['xs','s','m','l','xl'] as const).map(sz => (
            <div key={sz} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-3">
                <label className="font-sans text-label-lg font-bold text-on-surface">{t.services.breedsSize(sz.toUpperCase())}</label>
                <button onClick={() => handleAdd(sz)} className="flex items-center gap-1 text-primary text-sm font-semibold hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[18px]">add</span> {t.services.addBtn || 'Hinzufügen'}
                </button>
              </div>
              <div className="space-y-3">
                {breeds[sz].length === 0 && <p className="text-sm text-on-surface-variant/50 italic">Keine Rassen hinzugefügt</p>}
                {breeds[sz].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-outline">
                    <div className="relative w-12 h-12 rounded-full bg-surface-container-high border border-outline overflow-hidden shrink-0 group">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-on-surface-variant/50">pets</span>
                      )}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        {uploading === `${sz}-${idx}` ? (
                          <span className="material-symbols-outlined text-white animate-spin text-[18px]">sync</span>
                        ) : (
                          <span className="material-symbols-outlined text-white text-[18px]">upload</span>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(sz, idx, e)} />
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={e => handleChange(sz, idx, 'name', e.target.value)}
                      className="flex-1 bg-transparent border-b border-outline focus:border-primary px-2 py-1 outline-none font-sans text-on-surface"
                      placeholder="Name der Rasse..."
                    />
                    <button onClick={() => handleRemove(sz, idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-outline-variant flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 border border-outline font-sans text-label-lg py-3 rounded-full hover:bg-surface-container-low transition-colors">{t.cancel}</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-on-primary font-sans text-label-lg py-3 rounded-full hover:opacity-90 transition-all shadow-sm">
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceModal({
  service,
  onClose,
  onSave,
  t,
}: {
  service: Record<string, string> | null;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
  t: ReturnType<typeof useAdminLang>['t'];
}) {
  const [form, setForm] = useState<Record<string, string>>(service || { ...EMPTY_SERVICE });
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-outline-variant" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="font-display text-headline-sm text-on-surface">
            {service ? t.services.editTitle : t.services.newTitle}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.services.nameDeLabel}</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans" />
            </div>
            <div className="col-span-2">
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.services.nameUkLabel}</label>
              <input type="text" value={form.nameUk} onChange={e => set('nameUk', e.target.value)}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans" />
            </div>
            <div className="col-span-2">
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.services.descLabel}</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans" rows={2} />
            </div>
            <div>
              <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.services.categoryLabel}</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary outline-none font-sans">
                <option value="package">{t.services.packageOption}</option>
                <option value="addon">{t.services.addonOption}</option>
              </select>
            </div>
          </div>

          {/* Prices */}
          <div>
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-3">{t.services.pricesLabel}</p>
            <div className="grid grid-cols-5 gap-2">
              {(['xs','s','m','l','xl'] as const).map(sz => (
                <div key={sz}>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1 text-center">{sz.toUpperCase()}</label>
                  <input type="number" value={(form as Record<string, string>)[`price${sz.charAt(0).toUpperCase()+sz.slice(1)}`] || form[`price${sz.toUpperCase()}`] || ''}
                    onChange={e => set(`price${sz.charAt(0).toUpperCase()+sz.slice(1)}`, e.target.value)}
                    className="w-full bg-surface border border-outline rounded-xl px-2 py-2 focus:border-primary focus:ring-1 outline-none font-sans text-center" min="0" step="0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Durations */}
          <div>
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-3">{t.services.durationsLabel}</p>
            <div className="grid grid-cols-5 gap-2">
              {(['xs','s','m','l','xl'] as const).map(sz => (
                <div key={sz}>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1 text-center">{sz.toUpperCase()}</label>
                  <input type="number" value={(form as Record<string, string>)[`duration${sz.charAt(0).toUpperCase()+sz.slice(1)}`] || ''}
                    onChange={e => set(`duration${sz.charAt(0).toUpperCase()+sz.slice(1)}`, e.target.value)}
                    className="w-full bg-surface border border-outline rounded-xl px-2 py-2 focus:border-primary focus:ring-1 outline-none font-sans text-center" min="0" step="5" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-outline font-sans text-label-lg py-3 rounded-full hover:bg-surface-container-low transition-colors">
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.nameUk || !form.name}
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

export default function ServicesAdminPage() {
  const { t } = useAdminLang();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editService, setEditService] = useState<Record<string, string> | null | 'new'>(null);
  const [showBreedsModal, setShowBreedsModal] = useState(false);

  const fetchServices = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API}/services/all`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleSave = async (form: Record<string, string>) => {
    const token = localStorage.getItem('admin_token');
    const payload = {
      name: form.name, nameUk: form.nameUk, description: form.description, category: form.category,
      priceXs: Number(form.priceXs||form.priceXS||0), priceS: Number(form.priceS||0),
      priceM: Number(form.priceM||0), priceL: Number(form.priceL||0), priceXl: Number(form.priceXl||form.priceXL||0),
      durationXs: Number(form.durationXs||form.durationXS||0), durationS: Number(form.durationS||0),
      durationM: Number(form.durationM||0), durationL: Number(form.durationL||0), durationXl: Number(form.durationXl||form.durationXL||0),
    };

    if (form.id) {
      await fetch(`${API}/services/${form.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API}/services`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    }
    setEditService(null);
    fetchServices();
  };

  const toggleActive = async (id: number, current: boolean) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${API}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !current }),
    });
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s));
  };

  const deleteService = async (id: number) => {
    if (!confirm(t.services.deleteConfirm)) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`${API}/services/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s));
  };

  const toEditForm = (s: Service): Record<string, string> => ({
    id: String(s.id), name: String(s.name), nameUk: String(s.nameUk),
    description: String(s.description || ''), category: String(s.category),
    priceXs: String(s.priceXs), priceS: String(s.priceS), priceM: String(s.priceM),
    priceL: String(s.priceL), priceXl: String(s.priceXl),
    durationXs: String(s.durationXs), durationS: String(s.durationS), durationM: String(s.durationM),
    durationL: String(s.durationL), durationXl: String(s.durationXl),
  });

  const packages = services.filter(s => s.category === 'package');
  const addons = services.filter(s => s.category === 'addon');

  return (
    <AdminLayout title={t.services.title}>
      {editService && (
        <ServiceModal
          service={editService === 'new' ? null : editService}
          onClose={() => setEditService(null)}
          onSave={handleSave}
          t={t}
        />
      )}
      {showBreedsModal && <BreedsConfigModal onClose={() => setShowBreedsModal(false)} t={t} />}

      <header className="sticky top-0 bg-surface border-b border-outline-variant flex items-center justify-between px-6 h-16 shrink-0 z-40">
        <h2 className="font-display text-xl font-bold text-on-surface">{t.services.title}</h2>
        <div className="flex gap-3">
          <button onClick={() => setShowBreedsModal(true)} className="flex items-center gap-2 border border-outline text-on-surface font-sans text-label-lg py-2 px-4 rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">pets</span>
            {t.services.breedsBtn}
          </button>
          <button onClick={() => setEditService('new')} className="flex items-center gap-2 bg-primary text-on-primary font-sans text-label-lg py-2 px-4 rounded-full hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t.services.addBtn}
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 font-sans text-on-surface-variant">{t.loading}</div>
        ) : (
          <>
            {[
              { title: t.services.packages, items: packages },
              { title: t.services.addons, items: addons }
            ].map(({ title, items }) => (
              <div key={title}>
                <h3 className="font-sans text-label-lg text-on-surface-variant uppercase tracking-widest mb-3 pl-1">{title}</h3>
                <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-surface-container-low">
                          {t.services.tableHeaders.map((h: string) => (
                            <th key={h} className="px-4 py-3 text-left font-sans text-label-sm text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant">
                        {items.map((s) => (
                          <tr key={String(s.id)} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-4 py-3 min-w-[180px]">
                              <p className="font-sans text-label-lg text-on-surface">{String(s.nameUk)}</p>
                              <p className="font-sans text-label-sm text-on-surface-variant italic truncate max-w-[200px]">{String(s.name)}</p>
                            </td>
                            {(['priceXs','priceS','priceM','priceL','priceXl'] as const).map(k => (
                              <td key={k} className="px-4 py-3 font-display font-bold text-primary whitespace-nowrap">{String(s[k])}€</td>
                            ))}
                            <td className="px-4 py-3 font-sans text-on-surface-variant whitespace-nowrap">{String(s.durationM)} Min</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleActive(Number(s.id), Boolean(s.isActive))}
                                className={`font-sans text-label-sm px-3 py-1 rounded-full transition-colors ${s.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                              >
                                {s.isActive ? t.active : t.archive}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditService(toEditForm(s))}
                                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                                  title={t.services.editTooltip}
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => deleteService(Number(s.id))}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                  title={t.services.deleteTooltip}
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
