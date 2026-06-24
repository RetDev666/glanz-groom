import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && router.pathname !== '/login') {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router.pathname]);

  if (!checked && router.pathname !== '/login') return null;
  return <Component {...pageProps} />;
}
