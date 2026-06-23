import Head from 'next/head';
import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function TipsPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(t.tips.categories.all);
  const [search, setSearch] = useState('');

  const categories = [t.tips.categories.all, t.tips.categories.coat, t.tips.categories.food, t.tips.categories.behavior];

  const tips = [
    {
      id: 1,
      title: t.tips.articles['1'].title,
      desc: t.tips.articles['1'].desc,
      category: t.tips.categories.coat,
      readTime: `5 ${t.tips.readTime}`,
      featured: true,
      image: '/img-tips.png',
    },
    {
      id: 2,
      title: t.tips.articles['2'].title,
      desc: t.tips.articles['2'].desc,
      category: t.tips.categories.coat,
      readTime: `5 ${t.tips.readTime}`,
      featured: false,
      thumbStyle: { backgroundImage: `url('/img-spa.png')` },
    },
    {
      id: 3,
      title: t.tips.articles['3'].title,
      desc: t.tips.articles['3'].desc,
      category: t.tips.categories.behavior,
      readTime: `8 ${t.tips.readTime}`,
      featured: false,
      thumbStyle: { backgroundImage: `url('/img-hero.png')` },
    },
    {
      id: 4,
      title: t.tips.articles['4'].title,
      desc: t.tips.articles['4'].desc,
      category: t.tips.categories.food,
      readTime: `6 ${t.tips.readTime}`,
      featured: false,
      thumbStyle: {},
    },
  ];

  const filtered = tips.filter(tItem => {
    const matchCat = activeCategory === t.tips.categories.all || tItem.category === activeCategory;
    const matchSearch = tItem.title.toLowerCase().includes(search.toLowerCase()) ||
      tItem.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find(tItem => tItem.featured);
  const rest = filtered.filter(tItem => !tItem.featured);

  return (
    <Layout>
      <Head>
        <title>{t.tips.title}</title>
        <meta name="description" content={t.tips.metaDesc} />
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-12 pb-xl">
        <header className="mb-lg">
          <h1 className="font-display text-headline-lg md:text-headline-xl text-on-background mb-2">{t.tips.headerTitle}</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            {t.tips.headerDesc}
          </p>
        </header>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.tips.searchPlaceholder}
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-3 pl-12 pr-4 font-sans text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex overflow-x-auto gap-3 mb-lg pb-2 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-sans text-label-lg transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'border border-primary text-primary hover:bg-primary/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Featured article */}
          {featured && (
            <article 
              onClick={() => alert(t.tips.devAlert)}
              className="col-span-1 rounded-2xl overflow-hidden bg-surface border border-outline-variant shadow-sm relative group cursor-pointer h-[300px] md:h-[380px] flex flex-col justify-end"
            >
              <img
                src={featured.image}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col justify-end">
                <span className="inline-block bg-secondary text-on-secondary-container font-sans text-label-sm px-2 py-1 rounded mb-3 w-fit">
                  {t.tips.featuredLabel}
                </span>
                <h2 className="font-display text-headline-md text-white mb-2">{featured.title}</h2>
                <p className="font-sans text-body-md text-white/80">{featured.desc}</p>
              </div>
            </article>
          )}

          {/* Other articles */}
          {rest.map(tip => (
            <article 
              key={tip.id} 
              onClick={() => alert(t.tips.devAlert)}
              className="rounded-2xl p-5 bg-surface border border-outline-variant shadow-sm flex gap-4 items-center hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex-grow">
                <span className="font-sans text-label-sm text-primary uppercase tracking-widest">{tip.category}</span>
                <h3 className="font-display text-[18px] leading-snug text-on-background mb-1">{tip.title}</h3>
                <p className="font-sans text-label-sm text-on-surface-variant mb-2 line-clamp-2">{tip.desc}</p>
                <div className="flex items-center gap-1 text-primary font-sans text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>{tip.readTime}</span>
                </div>
              </div>
              {tip.thumbStyle && Object.keys(tip.thumbStyle).length > 0 && (
                <div
                  className="w-24 h-24 rounded-xl bg-surface-container-high overflow-hidden shrink-0 bg-cover bg-center"
                  style={tip.thumbStyle as React.CSSProperties}
                />
              )}
            </article>
          ))}

          {/* CTA card */}
          <div className="rounded-2xl p-6 bg-primary text-on-primary flex flex-col items-center text-center shadow-[0_8px_16px_rgba(174,47,52,0.2)]">
            <span className="material-symbols-outlined fill text-[48px] mb-3">pets</span>
            <h3 className="font-display text-[20px] mb-2">{t.tips.ctaTitle}</h3>
            <p className="font-sans text-label-sm text-white/90 mb-4">{t.tips.ctaDesc}</p>
            <Link href="/book" className="bg-white text-primary font-sans text-label-lg px-6 py-2 rounded-full shadow-sm hover:bg-surface-bright transition-colors">
              {t.tips.ctaBtn}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
