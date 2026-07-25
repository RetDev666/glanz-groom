import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

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
  
  // ─── Portfolio ──────────────────────────────────────────────────────────────
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const fallbackReviews = [
      { id: '1', authorName: t.home.reviews[1].author, text: t.home.reviews[1].text, rating: 5, authorPhoto: '/review-1.jpg' },
      { id: '2', authorName: t.home.reviews[2].author, text: t.home.reviews[2].text, rating: 5, authorPhoto: '/review-2.jpg' },
      { id: '3', authorName: t.home.reviews[3].author, text: t.home.reviews[3].text, rating: 5, authorPhoto: '/review-3.jpg' },
    ];

    // Parallel fetch — same data as before, one round-trip wait
    Promise.all([
      fetch(`${apiUrl}/reviews`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${apiUrl}/portfolio`).then(r => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([reviewData, portfolioData]) => {
      if (Array.isArray(reviewData) && reviewData.length > 0) {
        setReviews(reviewData);
      } else {
        setReviews(fallbackReviews);
      }
      if (Array.isArray(portfolioData)) {
        setPortfolioItems(portfolioData.filter((item: { isActive?: boolean }) => item.isActive));
      }
    }).finally(() => setReviewsLoading(false));
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
            fetchPriority="high"
            decoding="async"
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
      <section className="bg-gradient-to-r from-[#34d399] to-[#059669] py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.value}>
              <div className="font-display text-3xl md:text-4xl font-extrabold text-white">{s.value}</div>
              <div className="font-sans text-label-sm text-white/90 mt-1">{s.label}</div>
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#34d399] to-[#059669] text-white font-sans text-label-lg py-3 px-8 rounded-full shadow-md hover:opacity-90 transition-all active:scale-95"
            >
              {t.home.allServicesBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* PORTFOLIO / GALLERY */}
      {portfolioItems.length > 0 && (
        <section className="py-xl px-6 md:px-12 bg-surface-container-lowest overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-lg">
              <h2 className="font-display text-headline-lg text-on-surface mb-2">Unsere Arbeiten</h2>
              <p className="font-sans text-body-md text-on-surface-variant max-w-2xl mx-auto">
                Sehen Sie sich die Ergebnisse unserer Pflege an (Vorher & Nachher).
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.slice(0, 6).map(item => (
                <div key={item.id} className="transform transition-transform duration-300 hover:scale-[1.02]">
                  {item.beforeUrl ? (
                    <BeforeAfterSlider 
                      beforeUrl={item.beforeUrl} 
                      afterUrl={item.afterUrl} 
                      title={item.title} 
                    />
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-sm border border-outline-variant bg-surface-container-low">
                        <img src={item.afterUrl} alt={item.title || "Grooming"} className="w-full h-full object-contain" />
                      </div>
                      {item.title && (
                        <h4 className="font-display font-bold text-center text-on-surface text-lg">{item.title}</h4>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section className="py-xl px-6 md:px-12 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-headline-lg text-on-surface mb-lg text-center">Warum uns wählen?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container rounded-3xl p-8 border border-surface-variant text-center flex flex-col items-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[32px] text-primary">favorite</span>
              </div>
              <h3 className="font-display text-title-lg text-on-surface font-bold mb-3">Liebevolle Pflege</h3>
              <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">Wir behandeln jeden Hund mit größter Sorgfalt, Liebe und Geduld, als wäre es unser eigener.</p>
            </div>
            <div className="bg-surface-container rounded-3xl p-8 border border-surface-variant text-center flex flex-col items-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[32px] text-primary">workspace_premium</span>
              </div>
              <h3 className="font-display text-title-lg text-on-surface font-bold mb-3">Professionelle Qualität</h3>
              <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">Unsere erfahrenen Groomer nutzen nur hochwertige Produkte und modernste Techniken.</p>
            </div>
            <div className="bg-surface-container rounded-3xl p-8 border border-surface-variant text-center flex flex-col items-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[32px] text-primary">spa</span>
              </div>
              <h3 className="font-display text-title-lg text-on-surface font-bold mb-3">Stressfreies Erlebnis</h3>
              <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">Eine ruhige, entspannte Umgebung ohne Zeitdruck sorgt für das absolute Wohlbefinden Ihres Vierbeiners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-xl px-6 md:px-12 bg-gradient-to-r from-[#34d399] to-[#059669]">
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
