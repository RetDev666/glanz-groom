import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { t } = useTranslation();

  const processSteps = [
    { icon: 'bathtub', color: 'bg-secondary-container text-on-secondary-container', title: t.home.processSteps[1].title, desc: t.home.processSteps[1].desc },
    { icon: 'content_cut', color: 'bg-tertiary-container text-on-tertiary-container', title: t.home.processSteps[2].title, desc: t.home.processSteps[2].desc },
    { icon: 'favorite', color: 'bg-primary-fixed text-on-primary-fixed', title: t.home.processSteps[3].title, desc: t.home.processSteps[3].desc },
  ];

  // ─── Real Google Reviews ────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${apiUrl}/reviews`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          // Fallback: locale статичні відгуки
          setReviews([
            { id: '1', authorName: t.home.reviews[1].author, text: t.home.reviews[1].text, rating: 5, authorPhoto: '/review-1.jpg' },
            { id: '2', authorName: t.home.reviews[2].author, text: t.home.reviews[2].text, rating: 5, authorPhoto: '/review-2.jpg' },
            { id: '3', authorName: t.home.reviews[3].author, text: t.home.reviews[3].text, rating: 5, authorPhoto: '/review-3.jpg' },
          ]);
        }
      })
      .catch(() => {
        setReviews([
          { id: '1', authorName: t.home.reviews[1].author, text: t.home.reviews[1].text, rating: 5, authorPhoto: '/review-1.jpg' },
          { id: '2', authorName: t.home.reviews[2].author, text: t.home.reviews[2].text, rating: 5, authorPhoto: '/review-2.jpg' },
          { id: '3', authorName: t.home.reviews[3].author, text: t.home.reviews[3].text, rating: 5, authorPhoto: '/review-3.jpg' },
        ]);
      })
      .finally(() => setReviewsLoading(false));
  }, []);

  const stats = [
    { value: '500+', label: t.home.stats.clients },
    { value: '2000+', label: t.home.stats.procedures },
    { value: '5 ★', label: t.home.stats.rating },
    { value: '3', label: t.home.stats.groomers },
  ];

  return (
    <Layout>
      <Head>
        <title>Glanz & Groom — {t.home.heroTitle}</title>
        <meta name="description" content={t.home.heroDesc} />
      </Head>

      {/* HERO */}
      <section className="relative w-full min-h-[85vh] flex items-end pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-surface-variant">
          <img
            src="/img-hero.png"
            alt="Glanz & Groom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/40 to-transparent" />
        </div>

        <div className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto">
          <div className="max-w-2xl glass-card rounded-2xl p-8 md:p-10 shadow-2xl">
            <span className="font-sans text-label-lg text-primary uppercase tracking-widest block mb-2">
              {t.home.heroTag}
            </span>
            <h1 className="font-accent text-4xl md:text-5xl lg:text-6xl text-on-surface mb-4 leading-tight drop-shadow-sm">
              {t.home.heroTitle}
            </h1>
            <p className="font-sans text-body-md text-on-surface-variant mb-6">
              {t.home.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/book"
                className="flex items-center justify-center gap-2 bg-primary text-on-primary font-sans text-label-lg py-3 px-8 rounded-full shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95"
              >
                <span className="material-symbols-outlined fill text-[20px]">calendar_month</span>
                {t.home.bookBtn}
              </Link>
              <Link
                href="/services"
                className="flex items-center justify-center gap-2 border-2 border-primary text-primary font-sans text-label-lg py-3 px-8 rounded-full hover:bg-primary/5 transition-all"
              >
                {t.home.servicesBtn}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.value}>
              <div className="font-display text-3xl md:text-4xl font-extrabold text-on-primary">{s.value}</div>
              <div className="font-sans text-label-sm text-on-primary/80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-xl px-6 md:px-12 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-lg">
            <h2 className="font-display text-headline-lg text-on-surface mb-2">{t.home.processTitle}</h2>
            <p className="font-sans text-body-md text-on-surface-variant max-w-2xl mx-auto">
              {t.home.processDesc}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {processSteps.map(step => (
              <div
                key={step.title}
                className="flex-1 bg-surface-container-low rounded-2xl p-6 shadow-sm border border-surface-variant flex gap-4 items-start hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-outlined text-[24px]">{step.icon}</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-md text-on-surface mb-2 text-[20px]">{step.title}</h3>
                  <p className="font-sans text-body-md text-on-surface-variant text-[14px]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-sans text-label-lg py-3 px-8 rounded-full shadow-md hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-all active:scale-95"
            >
              {t.home.allServicesBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-xl px-6 md:px-12 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-headline-lg text-on-surface mb-lg text-center">{t.home.reviewsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsLoading ? (
              // Skeleton
              [1,2,3].map(i => (
                <div key={i} className="bg-surface-container rounded-2xl p-6 border border-surface-variant shadow-sm animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-surface-variant" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-surface-variant rounded w-2/3" />
                      <div className="h-3 bg-surface-variant rounded w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-surface-variant rounded" />
                    <div className="h-3 bg-surface-variant rounded w-5/6" />
                    <div className="h-3 bg-surface-variant rounded w-4/6" />
                  </div>
                </div>
              ))
            ) : (
              reviews.map((r, i) => (
                <div key={r.id || i} className="bg-surface-container rounded-2xl p-6 border border-surface-variant shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    {r.authorPhoto ? (
                      <img
                        src={r.authorPhoto}
                        alt={r.authorName}
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                        onError={(e: any) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                      />
                    ) : null}
                    <div
                      className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-lg flex-shrink-0"
                      style={{ display: r.authorPhoto ? 'none' : 'flex' }}
                    >
                      {(r.authorName || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-sans text-label-md text-on-surface font-semibold">{r.authorName}</p>
                      <div className="flex text-yellow-500 text-sm mt-0.5">
                        {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                      </div>
                    </div>
                  </div>
                  <p className="font-sans text-body-md text-on-surface-variant italic leading-relaxed">
                    «{(r.text || '').replace(/«|»|"/g, '').trim()}»
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-10">
            <a
              href="https://maps.app.goo.gl/NDd5SztVC6zd6C9i7?g_st=it"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-sans text-label-lg hover:underline"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
              Weitere Bewertungen auf Google Maps lesen
            </a>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-xl px-6 md:px-12 bg-gradient-to-r from-primary to-primary-container">
        <div className="max-w-3xl mx-auto text-center">
          <span className="material-symbols-outlined fill text-[48px] text-on-primary/80 mb-4 block">pets</span>
          <h2 className="font-display text-headline-lg text-on-primary mb-4">
            {t.home.ctaTitle}
          </h2>
          <p className="font-sans text-body-md text-on-primary/90 mb-8">
            {t.home.ctaDesc}
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-primary font-sans text-label-lg py-4 px-10 rounded-full shadow-lg hover:bg-surface-bright transition-all active:scale-95"
          >
            <span className="material-symbols-outlined fill text-[20px]">calendar_month</span>
            {t.home.ctaBtn}
          </Link>
        </div>
      </section>
    </Layout>
  );
}
