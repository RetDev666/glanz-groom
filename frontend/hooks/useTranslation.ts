import { useRouter } from 'next/router';
import { de } from '../locales/de';
import { en } from '../locales/en';
import { ru } from '../locales/ru';

export const useTranslation = () => {
  const router = useRouter();
  const { locale } = router;
  
  const t = locale === 'en' ? en : locale === 'ru' ? ru : de;
  
  return { t, locale, router };
};
