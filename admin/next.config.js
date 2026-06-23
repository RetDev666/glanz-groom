/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',        // статичний експорт → папка out/
  basePath: '/admin',      // всі посилання і роутер відносно /admin
  trailingSlash: true,     // /admin/login/ → out/login/index.html
  images: {
    unoptimized: true,     // next/image не підтримується в статичному експорті
  },
};
module.exports = nextConfig;
