import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import CookieConsent, { ConsentAwareTracking } from './CookieConsent';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { mergeLegalSettings } from '@/lib/legalDefaults';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showFab?: boolean;
}

export default function Layout({ children, showFab = true }: LayoutProps) {
  const { t } = useTranslation();
  const [tracking, setTracking] = useState({
    bannerEnabled: true,
    googleAnalyticsId: '',
    metaPixelId: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://glanz-groom.netlify.app/api';
        const res = await fetch(`${apiUrl}/settings`);
        if (!res.ok || cancelled) return;
        const raw = await res.json();
        const legal = mergeLegalSettings(raw);
        if (cancelled) return;
        setTracking({
          bannerEnabled: legal.cookieBannerEnabled,
          googleAnalyticsId: legal.analyticsEnabled ? legal.googleAnalyticsId : '',
          metaPixelId: legal.marketingEnabled ? legal.metaPixelId : '',
        });
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-16 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />

      <CookieConsent bannerEnabled={tracking.bannerEnabled} />
      <ConsentAwareTracking
        googleAnalyticsId={tracking.googleAnalyticsId}
        metaPixelId={tracking.metaPixelId}
      />

      {/* Floating Action Button (mobile) */}
      {showFab && (
        <Link
          href="/book"
          className="md:hidden fixed bottom-20 right-6 z-40 bg-primary text-on-primary rounded-full shadow-[0_8px_16px_rgba(174,47,52,0.3)] flex items-center gap-2 px-4 py-3 hover:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined fill text-[20px]">calendar_month</span>
          <span className="text-label-lg font-sans">{t.nav.book}</span>
        </Link>
      )}
    </div>
  );
}
