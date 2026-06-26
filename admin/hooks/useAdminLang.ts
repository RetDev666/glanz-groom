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
  // Always use German
  return {
    t: adminLocales['de'],
    lang: 'de',
    setLang: () => {},
    cycleLang: () => {},
    nextLabel: '',
  };
}
