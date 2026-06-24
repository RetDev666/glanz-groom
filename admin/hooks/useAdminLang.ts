import { useState, useEffect, useCallback } from 'react';
import { adminLocales, AdminLang, AdminTranslations } from '../locales/adminLocales';

const STORAGE_KEY = 'admin_lang';

export function useAdminLang(): {
  t: AdminTranslations;
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  cycleLang: () => void;
  nextLabel: string;
} {
  const [lang, setLangState] = useState<AdminLang>('de');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as AdminLang | null;
    if (stored && ['de', 'en', 'ru'].includes(stored)) {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((l: AdminLang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const cycle: Record<AdminLang, AdminLang> = { de: 'en', en: 'ru', ru: 'de' };
  const nextLabelMap: Record<AdminLang, string> = { de: 'EN', en: 'RU', ru: 'DE' };

  const cycleLang = useCallback(() => {
    setLang(cycle[lang]);
  }, [lang, setLang]);

  return {
    t: adminLocales[lang],
    lang,
    setLang,
    cycleLang,
    nextLabel: nextLabelMap[lang],
  };
}
