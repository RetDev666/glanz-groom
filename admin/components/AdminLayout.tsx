import Sidebar from './Sidebar';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

// Custom hook for polling appointments
function useAppointmentPolling() {
  const lastKnownIdRef = useRef<number | null>(null);
  const [newAppt, setNewAppt] = useState(false);

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
            
            // Dispatch event for components to refresh
            window.dispatchEvent(new Event('new-appointment'));
            
            // Show toast
            setNewAppt(true);
            setTimeout(() => setNewAppt(false), 5000);
            
            // Play sound
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

    // Check immediately, then every 10 seconds
    checkLatest();
    const interval = setInterval(checkLatest, 10000);
    return () => clearInterval(interval);
  }, []);

  return newAppt;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'CRM' }: AdminLayoutProps) {
  const showToast = useAppointmentPolling();
  
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
        <div className={`fixed top-4 right-4 z-[9999] transition-all duration-500 transform ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
          <div className="bg-primary text-on-primary px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border border-primary/20">
            <span className="material-symbols-outlined text-[28px] animate-bounce">notifications_active</span>
            <div>
              <p className="font-display font-bold text-lg leading-tight">Новий запис!</p>
              <p className="font-sans text-sm text-on-primary/80">Календар автоматично оновлено</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
