import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(props: any) {
  // Use the current locale from Next.js, default to 'de'
  const currentLocale = props.__NEXT_DATA__?.locale || 'de';
  
  return (
    <Html lang={currentLocale}>
      <Head>
        {/* Prevent Google Chrome from auto-translating the page, which was turning German into Ukrainian */}
        <meta name="google" content="notranslate" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&family=Titan+One&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
