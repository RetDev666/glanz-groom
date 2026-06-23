import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';

export default function OffersPage() {
  const { t } = useTranslation();

  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    fetch(`${apiUrl}/offers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOffers(data.filter(o => o.isActive));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Layout>
      <Head>
        <title>{t.offers.title}</title>
        <meta name="description" content={t.offers.metaDesc} />
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-xl flex flex-col gap-xl">
        {/* Header */}
        <header className="w-full text-center max-w-2xl mx-auto space-y-4">
          <h1 className="font-accent text-5xl text-on-background">{t.offers.headerTitle}</h1>
          <p className="font-sans text-body-lg text-on-surface-variant">
            {t.offers.headerDesc}
          </p>
        </header>

        {/* Featured offer */}
        {offers.map(offer => (
          <section
            key={offer.id}
            className="w-full relative rounded-[2rem] overflow-hidden shadow-lg border border-surface-variant flex flex-col md:flex-row group cursor-pointer hover:scale-[1.01] transition-transform duration-300"
          >
            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img
                src={offer.imageUrl || ''}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              {offer.badge && (
                <div className="absolute top-4 left-4 bg-secondary text-on-secondary-container font-sans text-label-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1 bg-opacity-90 backdrop-blur-md uppercase font-bold tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  {offer.badge}
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
              <h2 className="font-display text-headline-lg text-on-background mb-3">{offer.title}</h2>
              <p className="font-sans text-body-md text-on-surface-variant mb-6 whitespace-pre-line">{offer.desc}</p>
              <div className="mt-auto pt-4 border-t border-surface-variant flex justify-between items-center">
                <span className="font-display text-headline-md text-primary">{offer.value}</span>
                <Link
                  href="/book"
                  className="bg-primary text-on-primary font-sans text-label-lg rounded-full py-2 px-6 shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2"
                >
                  {offer.cta}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </section>
        ))}

        {offers.length === 0 && (
          <div className="text-center py-20 bg-surface-container-low rounded-3xl">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50 mb-4">local_offer</span>
            <p className="font-display text-xl text-on-surface-variant">Derzeit keine Aktionen verfügbar</p>
          </div>
        )}

      </div>
    </Layout>
  );
}
