import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Offer {
  id: number;
  title: string;
  desc: string;
  value: string;
  cta: string;
  imageUrl: string;
  badge: string;
  isActive: boolean;
}

export default function OffersAdminPage() {
  const { t } = useAdminLang();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API}/offers`);
      if (res.ok) {
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingOffer) return;
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    const method = editingOffer.id ? 'PUT' : 'POST';
    const url = editingOffer.id ? `${API}/offers/${editingOffer.id}` : `${API}/offers`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingOffer)
      });
      if (res.ok) {
        setEditingOffer(null);
        fetchOffers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.offers.deleteConfirm)) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/offers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const setField = (field: keyof Offer, value: any) => {
    if (editingOffer) setEditingOffer({ ...editingOffer, [field]: value });
  };

  return (
    <AdminLayout title={t.offers.title}>
      <header className="sticky top-0 bg-surface border-b border-outline-variant flex justify-between items-center px-6 h-16 shrink-0 z-40">
        <h2 className="font-display text-xl font-bold text-on-surface">{t.offers.title}</h2>
        <button
          onClick={() => setEditingOffer({ isActive: true, cta: t.offers.defaultCta })}
          className="bg-primary text-on-primary font-sans text-label-lg px-6 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t.offers.addBtn}
        </button>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map(offer => (
              <div key={offer.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-40 bg-surface-container flex items-center justify-center relative overflow-hidden">
                  {offer.imageUrl ? (
                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">image</span>
                  )}
                  {offer.badge && (
                    <span className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {offer.badge}
                    </span>
                  )}
                  {!offer.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-error text-on-error px-3 py-1 rounded-full text-sm font-bold">{t.offers.inactive}</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-headline-sm text-on-surface mb-2">{offer.title}</h3>
                  <p className="font-sans text-body-md text-on-surface-variant flex-1 mb-4 line-clamp-3">{offer.desc}</p>
                  <p className="font-display text-xl font-bold text-primary mb-4">{offer.value}</p>
                  
                  <div className="flex gap-2 mt-auto pt-4 border-t border-outline-variant">
                    <button
                      onClick={() => setEditingOffer(offer)}
                      className="flex-1 py-2 rounded-full font-sans text-label-md bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      {t.offers.editBtn}
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="py-2 px-4 rounded-full font-sans text-label-md bg-error/10 hover:bg-error/20 transition-colors text-error flex items-center justify-center"
                      title="Löschen"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {offers.length === 0 && (
              <div className="col-span-full py-16 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">local_offer</span>
                <p className="font-display text-xl">{t.offers.empty}</p>
                <p className="font-sans mt-2">{t.offers.emptyHint}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEditingOffer(null)}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h3 className="font-display text-headline-sm text-on-surface">
                {editingOffer.id ? t.offers.editTitle : t.offers.newTitle}
              </h3>
              <button onClick={() => setEditingOffer(null)} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.offers.titleLabel}</label>
                <input type="text" value={editingOffer.title || ''} onChange={e => setField('title', e.target.value)}
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans" />
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.offers.descLabel}</label>
                <textarea value={editingOffer.desc || ''} onChange={e => setField('desc', e.target.value)}
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.offers.valueLabel}</label>
                  <input type="text" value={editingOffer.value || ''} onChange={e => setField('value', e.target.value)}
                    className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans" />
                </div>
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.offers.badgeLabel}</label>
                  <input type="text" value={editingOffer.badge || ''} onChange={e => setField('badge', e.target.value)} placeholder={t.offers.badgePlaceholder}
                    className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans uppercase" />
                </div>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.offers.imageLabel}</label>
                <input type="text" value={editingOffer.imageUrl || ''} onChange={e => setField('imageUrl', e.target.value)}
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 outline-none font-sans" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="isActive" checked={editingOffer.isActive !== false} onChange={e => setField('isActive', e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer" />
                <label htmlFor="isActive" className="font-sans text-label-lg text-on-surface cursor-pointer select-none">
                  {t.offers.activeLabel}
                </label>
              </div>

              <div className="flex gap-3 pt-6">
                <button onClick={() => setEditingOffer(null)} className="flex-1 border border-outline font-sans text-label-lg py-3 rounded-full hover:bg-surface-container-low transition-colors">
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editingOffer.title || !editingOffer.value}
                  className="flex-1 bg-primary text-on-primary font-sans text-label-lg py-3 rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving ? t.offers.savingBtn : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
