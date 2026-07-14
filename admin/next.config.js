/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // Ensure networkFirst or networkOnly since it's online-only
  // next-pwa defaults to networkFirst for pages and cacheFirst for static assets.
  // This is good for "online-only" with offline fallback for static UI.
});

const nextConfig = {
  reactStrictMode: true,
  output: 'export',        // статичний експорт → папка out/
  basePath: '/admin',      // всі посилання і роутер відносно /admin
  trailingSlash: true,     // /admin/login/ → out/login/index.html
  images: {
    unoptimized: true,     // next/image не підтримується в статичному експорті
  },
};

module.exports = withPWA(nextConfig);
