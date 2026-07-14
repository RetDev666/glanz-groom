import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1a1a2e] border border-[#ffcc00]/20 rounded-2xl shadow-2xl p-5 z-[100] animate-in slide-in-from-bottom-10">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
          <img src="/admin/icon-192x192.png" alt="App Icon" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-white text-lg leading-tight">Als App installieren</h3>
          <p className="text-gray-300 text-sm mt-1 mb-3">Installieren Sie Glanz Groom auf Ihrem Gerät für einen schnellen Zugriff und Benachrichtigungen.</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleInstall}
              className="flex-1 bg-[#ffcc00] hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
            >
              Installieren
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
