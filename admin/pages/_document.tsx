import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="de">
      <Head>
        <meta name="google" content="notranslate" />
        <meta name="application-name" content="Glanz Groom" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Glanz Groom" />
        <meta name="description" content="Admin Dashboard für Glanz Groom" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1a1a2e" />

        <link rel="manifest" href="/admin/manifest.json" />
        <link rel="apple-touch-icon" href="/admin/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <link rel="icon" href="/admin/logo.png" />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  );
}
