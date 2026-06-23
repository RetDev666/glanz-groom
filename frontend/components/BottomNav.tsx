import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function BottomNav() {
  const router = useRouter();
  const { t } = useTranslation();

  const bottomLinks = [
    { href: '/', label: t.nav.home, icon: 'home' },
    { href: '/services', label: t.nav.services, icon: 'content_cut' },
    { href: '/book', label: t.nav.book, icon: 'calendar_month' },
    { href: '/tips', label: t.nav.tips, icon: 'lightbulb' },
    { href: '/about', label: t.nav.about, icon: 'info' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-variant flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.07)]">
      {bottomLinks.map(link => {
        const active = router.pathname === link.href || (link.href !== '/' && router.pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
              active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${active ? 'fill' : ''}`}>
              {link.icon}
            </span>
            <span className="text-[10px] font-medium leading-tight text-center">{link.label.split(' ')[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
