import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAdminLang } from '../hooks/useAdminLang';
import { useState, useEffect } from 'react';

export default function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const router = useRouter();
  const { t, lang } = useAdminLang();

  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  const allNavItems = [
    { href: '/', icon: 'dashboard', label: t.sidebar.dashboard },
    { href: '/calendar', icon: 'calendar_month', label: t.sidebar.calendar },
    { href: '/clients', icon: 'group', label: t.sidebar.clients },
    { href: '/appointments', icon: 'event_note', label: t.sidebar.appointments, badge: unreadCount },
    { href: '/services', icon: 'content_cut', label: t.sidebar.services },
    { href: '/groomers', icon: 'badge', label: t.sidebar.groomers },
    { href: '/offers', icon: 'local_offer', label: t.sidebar.offers },
  ];

  const navItems = userRole === 'groomer' 
    ? allNavItems.filter(i => ['/calendar', '/appointments'].includes(i.href))
    : allNavItems;

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r border-outline-variant bg-surface-container-lowest fixed left-0 top-0 z-50 shadow-sm">
      {/* Brand */}
      <div className="p-5 flex flex-col gap-0.5 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Glanz & Groom" className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <h1 className="font-display font-bold text-primary text-base leading-tight">Glanz & Groom</h1>
            <p className="font-sans text-label-sm text-on-surface-variant">{t.sidebar.panel}</p>
          </div>
        </div>
      </div>

      {/* New Appointment button */}
      <div className="px-4 py-4">
        <Link
          href="/appointments"
          className="flex items-center justify-center gap-2 bg-primary text-on-primary font-sans text-sm font-semibold rounded-full py-3 px-4 hover:bg-primary-container hover:text-on-primary-container transition-all w-full shadow-sm"
        >
          <span className="material-symbols-outlined fill text-[18px]">add</span>
          {t.sidebar.newAppointment}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="flex flex-col gap-0.5 px-3">
          {navItems.map(item => {
            const active = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-full transition-all ${
                    active
                      ? 'bg-secondary-container text-on-secondary-container font-semibold scale-95'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${active ? 'fill' : ''}`}>{item.icon}</span>
                    <span className="font-sans text-sm">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-outline-variant">
        <ul className="flex flex-col gap-0.5">
          {/* Language switcher removed */}
          {userRole !== 'groomer' && (
            <li>
              <Link href="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-full hover:bg-surface-container-high transition-colors ${router.pathname === '/settings' ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                <span className="material-symbols-outlined">settings</span>
                <span className="font-sans text-sm">{t.sidebar.settings}</span>
              </Link>
            </li>
          )}
          {userRole === 'developer' && (
            <>
              <li>
                <Link href="/admins" className={`flex items-center gap-3 px-4 py-3 rounded-full hover:bg-surface-container-high transition-colors ${router.pathname === '/admins' ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  <span className="font-sans text-sm">{t.sidebar.admins}</span>
                </Link>
              </li>
              <li>
                <Link href="/system" className={`flex items-center gap-3 px-4 py-3 rounded-full hover:bg-surface-container-high transition-colors ${router.pathname === '/system' ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">build</span>
                  <span className="font-sans text-sm">{t.sidebar.system}</span>
                </Link>
              </li>
            </>
          )}
          <li>
            <button onClick={logout} className="flex items-center gap-3 text-on-surface-variant px-4 py-3 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors w-full">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-sans text-sm">{t.sidebar.logout}</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
