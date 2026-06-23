import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();

  const footerLinks = [
    { href: '/services', label: t.nav.services },
    { href: '/offers', label: t.nav.offers },
    { href: '/about', label: t.nav.about },
    // You can add { href: '/terms', label: t.nav.terms } if you add it to translations
  ];

  return (
    <footer className="w-full py-12 px-6 md:px-12 border-t border-surface-variant bg-surface mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Glanz & Groom" className="h-12 w-12 object-cover rounded-lg opacity-80 hover:opacity-100 transition-all" />
        </Link>
        <nav className="flex flex-wrap justify-center gap-6">
          {footerLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-label-sm font-sans uppercase tracking-widest text-on-surface-variant hover:text-primary hover:translate-y-[-2px] transition-all underline underline-offset-4 decoration-primary/30"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-xs font-sans text-on-surface-variant/70 text-center md:text-right">
          © {new Date().getFullYear()} Glanz &amp; Groom.<br />
          {t.home.heroTag}
        </div>
      </div>
    </footer>
  );
}
