import Sidebar from './Sidebar';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

// Custom hook for polling appointments
function useAppointmentPolling() {
  const lastKnownIdRef = useRef<number | null>(null);
  const [newAppt, setNewAppt] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    const checkLatest = async () => {
      try {
        const res = await fetch(`${API}/appointments/latest`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (lastKnownIdRef.current === null) {
            lastKnownIdRef.current = data.id;
          } else if (data.id > lastKnownIdRef.current) {
            lastKnownIdRef.current = data.id;
            
            window.dispatchEvent(new Event('new-appointment'));
            
            setNewAppt(data);
            
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(e => console.log('Audio play prevented', e));
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    };

    checkLatest();
    const interval = setInterval(checkLatest, 10000);
    return () => clearInterval(interval);
  }, []);

  return { newAppt, setNewAppt };
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'CRM' }: AdminLayoutProps) {
  const { newAppt, setNewAppt } = useAppointmentPolling();
  const router = useRouter();
  
  const handleToastClick = () => {
    if (newAppt && newAppt.date) {
      // Navigate to calendar and maybe we could pass date query?
      // Since our calendar doesn't read ?date= yet, let's just go to /calendar
      // But we can store it in localStorage so calendar can read it?
      // For now, just navigate to calendar
      router.push('/calendar');
    }
    setNewAppt(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Head>
        <title>{title} — Glanz & Groom CRM</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col h-full bg-background overflow-auto relative">
        {children}
        
        {/* Notification Toast */}
        <div className={`fixed top-4 right-4 z-[9999] transition-all duration-500 transform ${newAppt ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
          <div 
            onClick={handleToastClick}
            className="bg-primary text-on-primary px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 border border-primary/20 cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[28px] animate-bounce">notifications_active</span>
            <div>
              <p className="font-display font-bold text-lg leading-tight">Neuer Termin!</p>
              {newAppt && newAppt.date && newAppt.client && (
                <p className="font-sans text-sm text-on-primary/90 mt-1">
                  {new Date(newAppt.date).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} Uhr
                  <br />
                  Kunde: {newAppt.client.firstName} {newAppt.client.lastName}
                </p>
              )}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setNewAppt(null); }}
              className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
