import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAdminLang } from '../hooks/useAdminLang';

export default function LoginPage() {
  const router = useRouter();
  const { t, cycleLang, nextLabel } = useAdminLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        router.replace('/');
      } else {
        setError(data.error || t.login.wrongCredentials);
      }
    } catch {
      setError(t.login.connectionError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-container flex items-center justify-center px-6">
      <Head>
        <title>{t.login.title}</title>
        <link rel="icon" href="/logo.png" />
      </Head>

      {/* Language switcher */}
      <button
        onClick={cycleLang}
        className="fixed top-4 right-4 font-sans text-sm font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm"
      >
        {nextLabel}
      </button>

      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Glanz & Groom" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="font-display text-2xl font-extrabold text-on-background">Glanz & Groom</h1>
          <p className="font-sans text-on-surface-variant mt-1">{t.login.panel}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block font-sans text-sm font-semibold text-on-surface mb-1.5">{t.login.email}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-surface-container-highest rounded-xl px-4 py-3.5 font-sans text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
              placeholder="admin@glanzgroom.ua"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-sans text-sm font-semibold text-on-surface mb-1.5">{t.login.password}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-surface border border-surface-container-highest rounded-xl px-4 py-3.5 font-sans text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-xl p-3 font-sans text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-sans font-semibold py-3.5 rounded-xl shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin material-symbols-outlined">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                {t.login.submit}
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
}
