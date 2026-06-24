import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';

const categoriesData = [
  {
    id: 'xs',
    title: 'XS',
    breeds: [{ name: 'Chihuahua', img: '/breeds/chihuahua.png' }],
    mainServices: [
      { id: 'well_cut', name: 'Wellness Paket – mit Haarschnitt', nameEn: 'Wellness Package – with Haircut', duration: '90', price: '90€' },
      { id: 'well_und', name: 'Wellness Paket – für Unterwolle', nameEn: 'Wellness Package – for Undercoat', duration: '80', price: '88€' },
      { id: 'hyg_kurz', name: 'Hygiene Paket – kurzhaarig', nameEn: 'Hygiene Package – short hair', duration: '40', price: '48€' },
      { id: 'hyg_lang', name: 'Hygiene Paket – langhaar', nameEn: 'Hygiene Package – long hair', duration: '60', price: '65€' },
      { id: 'hand_ohne', name: 'Handstripping ohne baden', nameEn: 'Handstripping (no bath)', duration: '50', price: '60€' },
      { id: 'hand_mit', name: 'Handstripping mit baden', nameEn: 'Handstripping (with bath)', duration: '90', price: '102€' },
    ],
    addServices: [
      { id: 'kral_ohne', name: 'Krallenpflege', nameEn: 'Nail Trimming', duration: '10', price: '10€' },
      { id: 'kral_mit', name: 'Krallenpflege + Pfoten', nameEn: 'Nail & Paw Care', duration: '15', price: '15€' },
      { id: 'zahn_std', name: 'Zahnreinigung', nameEn: 'Teeth Cleaning', duration: '10', price: '10€' },
      { id: 'zahn_ult', name: 'Zahnreinigung Ultraschall', nameEn: 'Ultrasonic Teeth Cleaning', duration: '30', price: '35€' },
      { id: 'fell', name: 'Fellmaske', nameEn: 'Coat Mask', duration: '10', price: '10€' },
      { id: 'entfilzung', name: 'Entfilzung (30m)', nameEn: 'De-matting (30m)', duration: '30', price: '32€' },
    ]
  },
  {
    id: 's',
    title: 'S',
    breeds: [{ name: 'Pomeranian', img: '/breeds/pomeranian.png' }, { name: 'Yorkie', img: '/breeds/yorkie.png' }],
    mainServices: [
      { id: 'well_cut', name: 'Wellness Paket – mit Haarschnitt', nameEn: 'Wellness Package – with Haircut', duration: '120', price: '120€' },
      { id: 'well_und', name: 'Wellness Paket – für Unterwolle', nameEn: 'Wellness Package – for Undercoat', duration: '100', price: '105€' },
      { id: 'hyg_kurz', name: 'Hygiene Paket – kurzhaarig', nameEn: 'Hygiene Package – short hair', duration: '60', price: '65€' },
      { id: 'hyg_lang', name: 'Hygiene Paket – langhaar', nameEn: 'Hygiene Package – long hair', duration: '80', price: '95€' },
      { id: 'hand_ohne', name: 'Handstripping ohne baden', nameEn: 'Handstripping (no bath)', duration: '65', price: '80€' },
      { id: 'hand_mit', name: 'Handstripping mit baden', nameEn: 'Handstripping (with bath)', duration: '120', price: '130€' },
    ],
    addServices: [
      { id: 'kral_ohne', name: 'Krallenpflege', nameEn: 'Nail Trimming', duration: '10', price: '10€' },
      { id: 'kral_mit', name: 'Krallenpflege + Pfoten', nameEn: 'Nail & Paw Care', duration: '15', price: '15€' },
      { id: 'zahn_std', name: 'Zahnreinigung', nameEn: 'Teeth Cleaning', duration: '10', price: '10€' },
      { id: 'zahn_ult', name: 'Zahnreinigung Ultraschall', nameEn: 'Ultrasonic Teeth Cleaning', duration: '30', price: '35€' },
      { id: 'fell', name: 'Fellmaske', nameEn: 'Coat Mask', duration: '10', price: '10€' },
      { id: 'entfilzung', name: 'Entfilzung (30m)', nameEn: 'De-matting (30m)', duration: '30', price: '32€' },
    ]
  },
  {
    id: 'm',
    title: 'M',
    breeds: [{ name: 'Frenchie', img: '/breeds/frenchie.png' }, { name: 'Beagle', img: '/breeds/beagle.png' }],
    mainServices: [
      { id: 'well_cut', name: 'Wellness Paket – mit Haarschnitt', nameEn: 'Wellness Package – with Haircut', duration: '140', price: '140€' },
      { id: 'well_und', name: 'Wellness Paket – für Unterwolle', nameEn: 'Wellness Package – for Undercoat', duration: '110', price: '122€' },
      { id: 'hyg_kurz', name: 'Hygiene Paket – kurzhaarig', nameEn: 'Hygiene Package – short hair', duration: '80', price: '82€' },
      { id: 'hyg_lang', name: 'Hygiene Paket – langhaar', nameEn: 'Hygiene Package – long hair', duration: '100', price: '117€' },
      { id: 'hand_ohne', name: 'Handstripping ohne baden', nameEn: 'Handstripping (no bath)', duration: '85', price: '100€' },
      { id: 'hand_mit', name: 'Handstripping mit baden', nameEn: 'Handstripping (with bath)', duration: '150', price: '150€' },
    ],
    addServices: [
      { id: 'kral_ohne', name: 'Krallenpflege', nameEn: 'Nail Trimming', duration: '10', price: '12€' },
      { id: 'kral_mit', name: 'Krallenpflege + Pfoten', nameEn: 'Nail & Paw Care', duration: '15', price: '18€' },
      { id: 'zahn_std', name: 'Zahnreinigung', nameEn: 'Teeth Cleaning', duration: '10', price: '12€' },
      { id: 'zahn_ult', name: 'Zahnreinigung Ultraschall', nameEn: 'Ultrasonic Teeth Cleaning', duration: '30', price: '35€' },
      { id: 'fell', name: 'Fellmaske', nameEn: 'Coat Mask', duration: '10', price: '15€' },
      { id: 'entfilzung', name: 'Entfilzung (30m)', nameEn: 'De-matting (30m)', duration: '30', price: '32€' },
    ]
  },
  {
    id: 'l',
    title: 'L',
    breeds: [{ name: 'Cocker', img: '/breeds/cocker.png' }],
    mainServices: [
      { id: 'well_cut', name: 'Wellness Paket – mit Haarschnitt', nameEn: 'Wellness Package – with Haircut', duration: '155', price: '155€' },
      { id: 'well_und', name: 'Wellness Paket – für Unterwolle', nameEn: 'Wellness Package – for Undercoat', duration: '130', price: '138€' },
      { id: 'hyg_kurz', name: 'Hygiene Paket – kurzhaarig', nameEn: 'Hygiene Package – short hair', duration: '100', price: '100€' },
      { id: 'hyg_lang', name: 'Hygiene Paket – langhaar', nameEn: 'Hygiene Package – long hair', duration: '125', price: '130€' },
      { id: 'hand_ohne', name: 'Handstripping ohne baden', nameEn: 'Handstripping (no bath)', duration: '110', price: '130€' },
      { id: 'hand_mit', name: 'Handstripping mit baden', nameEn: 'Handstripping (with bath)', duration: '170', price: '180€' },
    ],
    addServices: [
      { id: 'kral_ohne', name: 'Krallenpflege', nameEn: 'Nail Trimming', duration: '15', price: '15€' },
      { id: 'kral_mit', name: 'Krallenpflege + Pfoten', nameEn: 'Nail & Paw Care', duration: '20', price: '20€' },
      { id: 'zahn_std', name: 'Zahnreinigung', nameEn: 'Teeth Cleaning', duration: '15', price: '18€' },
      { id: 'zahn_ult', name: 'Zahnreinigung Ultraschall', nameEn: 'Ultrasonic Teeth Cleaning', duration: '40', price: '45€' },
      { id: 'fell', name: 'Fellmaske', nameEn: 'Coat Mask', duration: '10', price: '22€' },
      { id: 'entfilzung', name: 'Entfilzung (30m)', nameEn: 'De-matting (30m)', duration: '30', price: '32€' },
    ]
  },
  {
    id: 'xl',
    title: 'XL',
    breeds: [{ name: 'Retriever', img: '/breeds/golden.png' }, { name: 'Husky', img: '/breeds/husky.png' }, { name: 'GSD', img: '/breeds/gsd.png' }],
    mainServices: [
      { id: 'well_cut', name: 'Wellness Paket – mit Haarschnitt', nameEn: 'Wellness Package – with Haircut', duration: '185', price: '185€' },
      { id: 'well_und', name: 'Wellness Paket – für Unterwolle', nameEn: 'Wellness Package – for Undercoat', duration: '160', price: '171€' },
      { id: 'hyg_kurz', name: 'Hygiene Paket – kurzhaarig', nameEn: 'Hygiene Package – short hair', duration: '120', price: '128€' },
      { id: 'hyg_lang', name: 'Hygiene Paket – langhaar', nameEn: 'Hygiene Package – long hair', duration: '150', price: '158€' },
      { id: 'hand_ohne', name: 'Handstripping ohne baden', nameEn: 'Handstripping (no bath)', duration: '130', price: '150€' },
      { id: 'hand_mit', name: 'Handstripping mit baden', nameEn: 'Handstripping (with bath)', duration: '200', price: '210€' },
    ],
    addServices: [
      { id: 'kral_ohne', name: 'Krallenpflege', nameEn: 'Nail Trimming', duration: '15', price: '15€' },
      { id: 'kral_mit', name: 'Krallenpflege + Pfoten', nameEn: 'Nail & Paw Care', duration: '20', price: '22€' },
      { id: 'zahn_std', name: 'Zahnreinigung', nameEn: 'Teeth Cleaning', duration: '15', price: '20€' },
      { id: 'zahn_ult', name: 'Zahnreinigung Ultraschall', nameEn: 'Ultrasonic Teeth Cleaning', duration: '40', price: '45€' },
      { id: 'fell', name: 'Fellmaske', nameEn: 'Coat Mask', duration: '10', price: '22€' },
      { id: 'entfilzung', name: 'Entfilzung (30m)', nameEn: 'De-matting (30m)', duration: '30', price: '32€' },
    ]
  }
];

export default function ServicesPage() {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState('m');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbBreeds, setDbBreeds] = useState<Record<string, {name: string, img: string}[]>>({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbServices(data.filter(s => s.isActive));
        }
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
      .then(r => r.json())
      .then(data => {
        const parsed: Record<string, {name: string, img: string}[]> = { xs: [], s: [], m: [], l: [], xl: [] };
        const defaults: Record<string, {name: string, img: string}[]> = {
          'xs': [{ name: 'Chihuahua', img: '/breeds/chihuahua.png' }],
          's': [{ name: 'Pomeranian', img: '/breeds/pomeranian.png' }, { name: 'Yorkie', img: '/breeds/yorkie.png' }],
          'm': [{ name: 'Frenchie', img: '/breeds/frenchie.png' }, { name: 'Beagle', img: '/breeds/beagle.png' }],
          'l': [{ name: 'Cocker', img: '/breeds/cocker.png' }],
          'xl': [{ name: 'Retriever', img: '/breeds/golden.png' }, { name: 'Husky', img: '/breeds/husky.png' }, { name: 'GSD', img: '/breeds/gsd.png' }],
        };
        (['xs', 's', 'm', 'l', 'xl'] as const).forEach(sz => {
          const val = data[`breeds_${sz}`];
          if (val) {
            try {
              const arr = JSON.parse(val);
              if (Array.isArray(arr) && arr.length > 0) parsed[sz] = arr;
              else parsed[sz] = defaults[sz];
            } catch {
              parsed[sz] = val.split(',').map((n: string) => ({ name: n.trim(), img: '' }));
            }
          } else {
            parsed[sz] = defaults[sz];
          }
        });
        setDbBreeds(parsed);
      })
      .catch(console.error);
  }, []);

  const generateTabServices = (sizeKey: string) => {
    if (dbServices.length === 0) {
      return categoriesData.find(c => c.id === sizeKey) || categoriesData[2];
    }

    const isUk = locale === 'uk-UA';
    const mainServices = dbServices.filter(s => s.category === 'package').map(s => ({
      id: s.id.toString(),
      name: isUk ? s.nameUk : s.name,
      nameEn: s.name,
      duration: String(s[`duration${sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)}` as keyof typeof s]),
      price: `${s[`price${sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)}` as keyof typeof s]}€`,
    }));
    const addServices = dbServices.filter(s => s.category === 'addon').map(s => ({
      id: s.id.toString(),
      name: isUk ? s.nameUk : s.name,
      nameEn: s.name,
      duration: String(s[`duration${sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)}` as keyof typeof s]),
      price: `${s[`price${sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)}` as keyof typeof s]}€`,
    }));

    const sizesBreeds = Object.keys(dbBreeds).length > 0 ? dbBreeds : {
      'xs': [{ name: 'Chihuahua', img: '/breeds/chihuahua.png' }],
      's': [{ name: 'Pomeranian', img: '/breeds/pomeranian.png' }, { name: 'Yorkie', img: '/breeds/yorkie.png' }],
      'm': [{ name: 'Frenchie', img: '/breeds/frenchie.png' }, { name: 'Beagle', img: '/breeds/beagle.png' }],
      'l': [{ name: 'Cocker', img: '/breeds/cocker.png' }],
      'xl': [{ name: 'Retriever', img: '/breeds/golden.png' }, { name: 'Husky', img: '/breeds/husky.png' }, { name: 'GSD', img: '/breeds/gsd.png' }],
    };

    return {
      id: sizeKey,
      title: sizeKey.toUpperCase(),
      breeds: sizesBreeds[sizeKey] || [],
      mainServices,
      addServices
    };
  };

  const activeData = generateTabServices(activeTab);

  const toggleService = (name: string) => {
    setSelectedServices(prev => 
      prev.includes(name) 
        ? prev.filter(s => s !== name) 
        : [...prev, name]
    );
  };

  const getBookingUrl = () => {
    const url = new URLSearchParams();
    url.set('size', activeTab);
    if (selectedServices.length > 0) {
      url.set('services', selectedServices.join(','));
    }
    return `/book?${url.toString()}`;
  };

  return (
    <Layout>
      <Head>
        <title>{t.services.title}</title>
      </Head>

      {/* STUNNING HERO SECTION */}
      <section className="relative w-full pt-32 pb-24 overflow-hidden bg-[#FAFAFA]">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-50/50 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        
        <div className="relative z-10 px-6 max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 font-sans text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm border border-red-100">
            {t.services.badge}
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            {t.services.heroTitle1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-500">{t.services.heroTitle2}</span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t.services.heroDesc}
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto min-h-screen relative -mt-10">
        
        {/* ULTRA-PREMIUM GLASS TABS */}
        <div className="mb-16 flex justify-center sticky top-24 z-30 pointer-events-none">
          <div className="inline-flex items-center gap-1 p-2 bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/50 pointer-events-auto">
            {categoriesData.map(cat => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id);
                    setSelectedServices([]); 
                  }}
                  className={`relative px-6 py-3 rounded-full font-sans font-semibold text-sm transition-all duration-500 ${
                    isActive 
                      ? 'text-white shadow-lg transform scale-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50 scale-95 hover:scale-100'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] -z-10" />
                  )}
                  {cat.id.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CATEGORY CONTENT */}
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 pb-40">
          
          <div className="flex flex-col items-center mb-16">
            <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mb-6 font-semibold">{t.services.forWhom}</p>
            <div className="flex justify-center gap-6">
              {activeData.breeds.map(b => (
                <div key={b.name} className="flex flex-col items-center gap-3 group cursor-default">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-md ring-4 ring-white group-hover:ring-red-50 transition-all duration-300 group-hover:-translate-y-2">
                    <img src={b.img} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <span className="font-sans text-sm text-gray-600 font-medium">{b.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-16">
            {/* LUXURY PACKAGES GRID */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                  <span className="material-symbols-outlined">diamond</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">{t.services.mainPackages}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeData.mainServices.map(svc => {
                  const isSelected = selectedServices.includes(svc.name);
                  const displayName = locale === 'en' ? (svc as any).nameEn : svc.name;
                  const displayDuration = locale === 'en' ? `${svc.duration} min` : `${svc.duration} Min`;
                  return (
                    <div 
                      key={svc.id} 
                      onClick={() => toggleService(svc.name)}
                      className={`group cursor-pointer rounded-[2rem] p-6 md:p-8 flex flex-col transition-all duration-500 relative overflow-hidden bg-white ${
                        isSelected 
                          ? 'shadow-[0_20px_40px_rgba(220,38,38,0.15)] ring-2 ring-red-500 -translate-y-1' 
                          : 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1'
                      }`}
                    >
                      {isSelected && <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/20 rounded-full blur-3xl" />}
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                          <h4 className="font-display font-bold text-gray-900 text-xl leading-tight mb-2">{displayName}</h4>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-red-50 group-hover:text-red-400'
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {isSelected ? 'check' : 'add'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-end justify-between relative z-10 pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">{t.services.cost}</span>
                          <span className="font-display font-bold text-gray-900 text-2xl">{svc.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-500">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          <span className="font-sans text-xs font-semibold">{displayDuration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SPA ADDONS GRID */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined">spa</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">{t.services.spaPackages}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeData.addServices.map(svc => {
                  const isSelected = selectedServices.includes(svc.name);
                  const displayName = locale === 'en' ? (svc as any).nameEn : svc.name;
                  const displayDuration = locale === 'en' ? `${svc.duration} min` : `${svc.duration} Min`;
                  return (
                    <div 
                      key={svc.id} 
                      onClick={() => toggleService(svc.name)}
                      className={`cursor-pointer rounded-2xl p-5 flex items-center justify-between transition-all duration-300 bg-white ${
                        isSelected 
                          ? 'shadow-lg shadow-amber-500/10 ring-2 ring-amber-400' 
                          : 'shadow-sm border border-gray-100 hover:shadow-md'
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <h4 className="font-sans font-semibold text-gray-800 text-sm mb-1">{displayName}</h4>
                        <div className="flex items-center gap-3">
                          <span className="font-display font-bold text-amber-600">{svc.price}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="font-sans text-xs text-gray-400">{displayDuration}</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-200 text-transparent'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">done</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* POPULAR BUNDLES */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                  <span className="material-symbols-outlined">hotel_class</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-gray-900">{t.services.popularBundles}</h3>
                  <p className="font-sans text-sm text-gray-500">{t.services.bundlesSubtitle}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    name: t.services.bundles[1].name,
                    desc: t.services.bundles[1].desc,
                    services: ["Wellness Paket – mit Haarschnitt", "Zahnreinigung Ultraschall", "Fellmaske"]
                  },
                  {
                    name: t.services.bundles[2].name,
                    desc: t.services.bundles[2].desc,
                    services: ["Hygiene Paket – kurzhaarig", "Krallenpflege + Pfoten", "Zahnreinigung"]
                  }
                ].map(bundle => {
                  const bundlePrice = bundle.services.reduce((sum, sName) => {
                    const svc = [...activeData.mainServices, ...activeData.addServices].find(s => s.name === sName);
                    return sum + (svc ? parseInt(svc.price) : 0);
                  }, 0);

                  const isFullySelected = bundle.services.every(s => selectedServices.includes(s));

                  return (
                    <div 
                      key={bundle.name}
                      className="group relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 bg-gray-900"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-6">
                          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/10">
                            {t.services.bestseller}
                          </span>
                          <h4 className="font-display font-bold text-white text-2xl mb-2">{bundle.name}</h4>
                          <p className="font-sans text-sm text-gray-400">{bundle.desc}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                          {bundle.services.map(s => {
                            const foundSvc = [...activeData.mainServices, ...activeData.addServices].find(x => x.name === s);
                            const svcName = locale === 'en' && foundSvc ? (foundSvc as any).nameEn : s;
                            return (
                              <span key={s} className="px-2 py-1 bg-white/5 rounded text-[11px] text-gray-300 border border-white/5">
                                {svcName}
                              </span>
                            );
                          })}
                        </div>
                        
                        <div className="mt-auto flex items-end justify-between">
                          <div className="flex flex-col">
                            <span className="font-sans text-[10px] text-gray-500 uppercase tracking-wider mb-1">{t.services.totalCost}</span>
                            <span className="font-display font-bold text-white text-3xl">{bundlePrice}€</span>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const newSelections = [...selectedServices];
                              bundle.services.forEach(s => {
                                if (!newSelections.includes(s)) newSelections.push(s);
                              });
                              setSelectedServices(newSelections);
                            }}
                            disabled={isFullySelected}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isFullySelected 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white hover:bg-red-400 group-hover:scale-110 shadow-lg shadow-red-500/30'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[24px]">
                              {isFullySelected ? 'check' : 'add'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* GLASSMORPHISM FLOATING CART */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${selectedServices.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-900/95 backdrop-blur-xl p-2 pl-6 md:pl-8 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-6 md:gap-10">
          <div className="flex flex-col py-2">
            <span className="font-sans text-xs text-gray-400 font-medium">{t.services.selection}</span>
            <span className="font-display font-bold text-white text-lg">
              {selectedServices.length} {t.services.serviceCount(selectedServices.length)}
            </span>
          </div>
          <Link 
            href={getBookingUrl()} 
            className="px-6 md:px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-full font-sans font-bold text-sm md:text-base shadow-lg shadow-red-500/30 transition-all flex items-center gap-2 group"
          >
            {t.services.bookBtn}
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">east</span>
          </Link>
        </div>
      </div>

    </Layout>
  );
}
