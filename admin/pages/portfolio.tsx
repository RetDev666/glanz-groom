import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdminLang } from '../hooks/useAdminLang';

const API = process.env.NEXT_PUBLIC_API_URL;

interface PortfolioItem {
  id: number;
  title: string | null;
  beforeUrl: string | null;
  afterUrl: string;
  isActive: boolean;
}

export default function PortfolioAdminPage() {
  const { t } = useAdminLang();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<PortfolioItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<'before' | 'after' | false>(false);
  
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API}/portfolio`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    if (!editingItem.afterUrl) {
      setSaveError('Photo "Nachher" (After) ist erforderlich.');
      return;
    }
    
    setSaving(true);
    setSaveError(null);
    const token = localStorage.getItem('admin_token');
    const method = editingItem.id ? 'PUT' : 'POST';
    const url = editingItem.id ? `${API}/portfolio/${editingItem.id}` : `${API}/portfolio`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingItem)
      });

      if (res.ok) {
        setEditingItem(null);
        fetchItems();
      } else {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setSaveError(errData.error || `Fehler ${res.status}`);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Serverfehler');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie dieses Bild wirklich löschen?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API}/portfolio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = async (file: File, type: 'before' | 'after') => {
    setUploadingPhoto(type);
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`${API}/upload/portfolio-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (type === 'before') {
          setEditingItem(prev => prev ? { ...prev, beforeUrl: data.url } : null);
        } else {
          setEditingItem(prev => prev ? { ...prev, afterUrl: data.url } : null);
        }
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploadingPhoto(false);
      if (type === 'before' && beforeInputRef.current) beforeInputRef.current.value = '';
      if (type === 'after' && afterInputRef.current) afterInputRef.current.value = '';
    }
  };

  return (
    <AdminLayout title="Galerie">
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-on-surface">Galerie (Vorher / Nachher)</h1>
            <p className="font-sans text-on-surface-variant mt-1">Verwalten Sie Ihre Vorher-/Nachher-Bilder</p>
          </div>
          <button
            onClick={() => setEditingItem({ isActive: true, afterUrl: '' })}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors font-sans font-semibold text-sm shadow-sm"
          >
            <span className="material-symbols-outlined">add</span>
            Neues Foto
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-surface-container rounded-3xl p-12 text-center border border-outline-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">photo_library</span>
            <h3 className="font-display text-xl font-bold text-on-surface">Keine Fotos</h3>
            <p className="font-sans text-on-surface-variant mt-2">Klicken Sie oben, um ein neues Foto hinzuzufügen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-surface-container rounded-3xl overflow-hidden shadow-sm border border-outline-variant group">
                <div className="flex h-48 bg-surface-container-highest">
                  {item.beforeUrl && (
                    <div className="w-1/2 relative border-r border-outline-variant">
                      <img src={item.beforeUrl} alt="Before" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-sans uppercase">Vorher</div>
                    </div>
                  )}
                  <div className={item.beforeUrl ? "w-1/2 relative" : "w-full relative"}>
                    <img src={item.afterUrl} alt="After" className="w-full h-full object-cover" />
                    {item.beforeUrl && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-sans uppercase">Nachher</div>
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between h-auto gap-4">
                  <div>
                    <h3 className="font-display font-bold text-on-surface text-lg leading-tight mb-1">{item.title || 'Ohne Titel'}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="font-sans text-xs text-on-surface-variant">{item.isActive ? 'Aktiv' : 'Inaktiv'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="flex-1 flex items-center justify-center gap-1 border border-outline text-on-surface px-3 py-2 rounded-xl hover:bg-surface-container-highest transition-colors font-sans text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-error-container text-on-error-container px-3 py-2 rounded-xl hover:bg-red-200 transition-colors font-sans text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-auto border border-outline-variant">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container sticky top-0 z-10">
              <h2 className="font-display font-bold text-xl text-on-surface">
                {editingItem.id ? 'Foto bearbeiten' : 'Neues Foto'}
              </h2>
              <button 
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
              {saveError && (
                <div className="p-3 bg-error-container text-on-error-container rounded-xl font-sans text-sm">
                  {saveError}
                </div>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="font-sans text-sm font-medium text-on-surface">Name / Titel (optional)</span>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="z.B. Bella"
                  className="px-4 py-3 bg-surface border border-outline rounded-xl font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </label>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* BEFORE IMAGE */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="font-sans text-sm font-medium text-on-surface">Vorher Foto (optional)</span>
                  <div 
                    className="h-32 rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface hover:bg-surface-container transition-colors cursor-pointer relative overflow-hidden group"
                    onClick={() => beforeInputRef.current?.click()}
                  >
                    {editingItem.beforeUrl ? (
                      <>
                        <img src={editingItem.beforeUrl} alt="Before" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white">edit</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-on-surface-variant">
                        {uploadingPhoto === 'before' ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        ) : (
                          <>
                            <span className="material-symbols-outlined mb-1">add_a_photo</span>
                            <span className="font-sans text-xs">Vorher hochladen</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={beforeInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handlePhotoUpload(e.target.files[0], 'before');
                      }
                    }}
                  />
                  {editingItem.beforeUrl && (
                    <button 
                      onClick={() => setEditingItem({ ...editingItem, beforeUrl: null })}
                      className="text-error text-xs text-center hover:underline mt-1"
                    >
                      Entfernen
                    </button>
                  )}
                </div>

                {/* AFTER IMAGE */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="font-sans text-sm font-medium text-on-surface">Nachher Foto (erforderlich)</span>
                  <div 
                    className={`h-32 rounded-xl border-2 border-dashed ${!editingItem.afterUrl ? 'border-primary/50 bg-primary-container/20' : 'border-outline-variant bg-surface'} flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer relative overflow-hidden group`}
                    onClick={() => afterInputRef.current?.click()}
                  >
                    {editingItem.afterUrl ? (
                      <>
                        <img src={editingItem.afterUrl} alt="After" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white">edit</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-primary">
                        {uploadingPhoto === 'after' ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        ) : (
                          <>
                            <span className="material-symbols-outlined mb-1">add_a_photo</span>
                            <span className="font-sans text-xs">Nachher hochladen</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={afterInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handlePhotoUpload(e.target.files[0], 'after');
                      }
                    }}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container-lowest transition-colors mt-2">
                <input
                  type="checkbox"
                  checked={editingItem.isActive}
                  onChange={e => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="font-sans text-sm text-on-surface">Auf der Website anzeigen</span>
              </label>

            </div>

            <div className="p-6 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-3 sticky bottom-0 z-10">
              <button
                onClick={() => setEditingItem(null)}
                className="px-5 py-2.5 rounded-full font-sans font-semibold text-sm text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingPhoto !== false || !editingItem.afterUrl}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-sans font-semibold text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
