import Head from 'next/head';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';

interface Groomer {
  id: number;
  name: string;
  role: string;
  color: string;
  photoUrl?: string;
  isActive: boolean;
}

export default function AboutPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    Promise.all([
      fetch(`${apiUrl}/groomers`).then(r => r.json()).catch(() => []),
      fetch(`${apiUrl}/settings`).then(r => r.json()).catch(() => ({}))
    ]).then(([groomersData, settingsData]) => {
      setGroomers(Array.isArray(groomersData) ? groomersData : []);
      setSettings(settingsData || {});
    });
  }, []);

  // Fallback static team if API returns nothing
  const fallbackTeam = [
    { name: t.about.team[1].name, role: t.about.team[1].role, initials: 'SJ', color: '#ae2f34', photoUrl: null },
    { name: t.about.team[2].name, role: t.about.team[2].role, initials: 'DC', color: '#785900', photoUrl: null },
    { name: t.about.team[3].name, role: t.about.team[3].role, initials: 'ER', color: '#506073', photoUrl: null },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t.about.title}</title>
        <meta name="description" content={t.about.standardDesc1} />
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-xl">
        {/* About story */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-lg items-center mb-xl">
          <div>
            <h1 className="font-display text-headline-xl text-on-surface mb-6">{t.about.standardTitle}</h1>
            <p className="font-sans text-body-lg text-on-surface-variant mb-4">
              {t.about.standardDesc1}
            </p>
            <p className="font-sans text-body-md text-on-surface-variant">
              {t.about.standardDesc2}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-sm bg-surface-container aspect-[4/3]">
            <img
              src="/img-hero.png"
              alt="Glanz & Groom"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Philosophy */}
        <section className="mb-xl bg-surface-container-low rounded-2xl p-8 md:p-12 text-center border border-surface-variant">
          <h2 className="font-display text-headline-lg text-on-surface mb-6">{t.about.philosophyTitle}</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="font-sans text-body-lg text-on-surface-variant">
              {t.about.philosophyDesc1}
            </p>
            <p className="font-sans text-body-md text-on-surface-variant">
              {t.about.philosophyDesc2}
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="mb-xl">
          <h2 className="font-display text-headline-lg text-on-surface mb-lg text-center">{t.about.teamTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {(groomers.length > 0 ? groomers : fallbackTeam).map(member => (
              <div key={member.name} className="bg-surface rounded-2xl border border-surface-container-highest shadow-sm p-6 text-center hover:-translate-y-1 transition-transform duration-300">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-20 h-20 mx-auto rounded-full object-cover shadow-md mb-4 border-4 border-surface"
                  />
                ) : (
                  <div
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center font-display text-2xl font-bold mb-4 text-white shadow-md"
                    style={{ backgroundColor: member.color || '#ae2f34' }}
                  >
                    {member.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-display text-headline-md text-on-surface">{member.name}</h3>
                <p className="font-sans text-label-lg text-primary mb-2">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-lg bg-surface-container-low rounded-2xl p-6 md:p-10 shadow-sm border border-surface-variant">
          {/* Contact info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <h2 className="font-display text-headline-lg text-on-surface mb-2">{t.about.contactTitle}</h2>
              <p className="font-sans text-body-md text-on-surface-variant">
                {t.about.contactDesc}
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: 'location_on', title: t.about.addressTitle, text: settings.address || t.about.address, link: 'https://maps.app.goo.gl/NDd5SztVC6zd6C9i7?g_st=it' },
                { icon: 'phone', title: t.about.phoneTitle, text: settings.phone || '+49 176 20331535' },
                { icon: 'photo_camera', title: 'Instagram', text: '@glanz_groom', link: settings.instagram || 'https://www.instagram.com/glanz_groom?igsh=MXNvMmVrYmRwZDVyMw==' },
                { icon: 'schedule', title: t.about.scheduleTitle, text: settings.openingHours || t.about.schedule },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 bg-surface p-3 rounded-xl border border-surface-container-highest">
                  <span className="material-symbols-outlined text-primary fill text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-sans text-label-lg text-on-surface">{item.title}</p>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-sans text-body-md text-primary hover:underline">{item.text}</a>
                    ) : (
                      <p className="font-sans text-body-md text-on-surface-variant whitespace-pre-line">{item.text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Map link */}
            <a 
              href="https://maps.app.goo.gl/NDd5SztVC6zd6C9i7?g_st=it" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-48 bg-surface-container-high rounded-2xl flex flex-col items-center justify-center text-on-surface-variant border border-surface-container-highest hover:bg-surface-container transition-colors cursor-pointer group"
            >
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity">map</span>
              <span className="font-sans text-label-lg">{t.about.openMap}</span>
              <span className="font-sans text-body-sm mt-1 opacity-70">Rezensieren Sie uns auf Google!</span>
            </a>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7 bg-surface rounded-2xl p-6 md:p-8 border border-surface-container-highest shadow-md">
            <h3 className="font-display text-headline-md text-on-surface mb-6 pb-4 border-b border-surface-container">{t.about.formTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block font-sans text-label-lg text-on-surface mb-1">{t.about.formName}</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 font-sans text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-sans text-label-lg text-on-surface mb-1">{t.about.formEmail}</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 font-sans text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block font-sans text-label-lg text-on-surface mb-1">{t.about.formSubject}</label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                  placeholder={t.about.formSubjectPlaceholder}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 font-sans text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                />
              </div>
              <div>
                <label htmlFor="message" className="block font-sans text-label-lg text-on-surface mb-1">{t.about.formMessage}</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  required
                  rows={5}
                  placeholder={t.about.formMessagePlaceholder}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 font-sans text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow resize-y"
                />
              </div>
              {status === 'success' && (
                <div className="bg-secondary-fixed/30 text-on-secondary-fixed rounded-xl p-3 text-center font-sans text-body-md">
                  {t.about.formSuccess}
                </div>
              )}
              {status === 'error' && (
                <div className="bg-error-container text-on-error-container rounded-xl p-3 text-center font-sans text-body-md">
                  {t.about.formError}
                </div>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary font-sans text-label-lg px-8 py-3 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm disabled:opacity-50 mx-auto"
              >
                {status === 'loading' ? (
                  <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">send</span>
                )}
                {status === 'loading' ? t.about.formSending : t.about.formSend}
              </button>
            </form>
          </div>
        </section>
      </div>
    </Layout>
  );
}
