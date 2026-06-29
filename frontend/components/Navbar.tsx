import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function Navbar() {
  const { t, locale, router } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/services', label: t.nav.services },
    { href: '/offers', label: t.nav.offers },
    { href: '/about', label: t.nav.about },
  ];

  const nextLocaleMap: Record<string, string> = { de: 'en', en: 'ru', ru: 'de' };
  const localeLabelMap: Record<string, string> = { de: 'EN', en: 'RU', ru: 'DE' };

  const toggleLang = () => {
    const nextLocale = nextLocaleMap[locale ?? 'de'] ?? 'en';
    router.push(router.pathname, router.asPath, { locale: nextLocale });
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-surface-container bg-surface-container-lowest/90 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center h-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Glanz & Groom"
            className="h-14 w-14 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display font-extrabold text-lg text-primary tracking-tight">Glanz & Groom</span>
            <span className="font-sans text-[11px] text-on-surface-variant tracking-widest uppercase">Hundesalon</span>
          </div>
        </Link>

        {/* Mobile: hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLang}
            className="px-2 py-1 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            {localeLabelMap[locale ?? 'de'] ?? 'EN'}
          </button>
          <button
            className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            <span className="material-symbols-outlined text-2xl">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-label-lg font-sans transition-all duration-200 ${
                router.pathname === link.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA & Lang Switch */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleLang}
            className="text-label-lg font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            {localeLabelMap[locale ?? 'de'] ?? 'EN'}
          </button>
          <Link
            href="/book"
            className="flex items-center gap-2 bg-primary text-on-primary text-label-lg rounded-full py-2 px-6 shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px] fill">calendar_month</span>
            {t.nav.book}
          </Link>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-container bg-surface-container-lowest px-6 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-body-md font-sans transition-colors ${
                router.pathname === link.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="block w-full text-center bg-primary text-on-primary text-label-lg rounded-full py-3 px-6 mt-4 hover:bg-primary-container hover:text-on-primary-container transition-all"
          >
            {t.nav.book}
          </Link>
        </div>
      )}
    </nav>
  );
}
