#!/bin/bash
# Netlify Build Script — Glanz & Groom CRM
# Netlify запускає цей скрипт з директорії frontend/ (base directory)
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🐾 Glanz & Groom — Netlify Build Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Netlify запускає скрипт з frontend/ — переходимо до кореня репо
cd ..

# ── 1. Кореневі залежності (для Netlify Functions / esbuild) ────────────────
echo "📦 [1/5] Installing root dependencies..."
npm install
echo "✅ Root dependencies installed"
echo ""

# ── 2. Prisma: генерація клієнта ────────────────────────────────────────────
echo "🔧 [2/5] Generating Prisma client..."
npx prisma generate --schema=backend/prisma/schema.prisma
echo "✅ Prisma client generated"
echo ""

# ── 3. Prisma: push схеми (ВИЛУЧЕНО) ────────────────────────────────────────
echo "🗄️  [3/5] Database setup..."
echo "⚠️  Skipping db push — Prisma CLI requires local SQLite files."
echo "    Tables should be created manually in Turso dashboard via SQL."
echo ""

# ── 4. Admin: статичний білд → frontend/public/admin/ ───────────────────────
echo "🔨 [4/5] Building admin panel..."
npm --prefix admin install
NEXT_PUBLIC_API_URL=/api npm --prefix admin run build
mkdir -p frontend/public/admin
cp -r admin/out/. frontend/public/admin/
echo "✅ Admin panel built → /admin"
echo ""

# ── 5. Frontend: Next.js білд ────────────────────────────────────────────────
# Примітка: Netlify вже встановив frontend deps (base="frontend")
echo "🌐 [5/5] Building frontend..."
cd frontend
npm run build
echo "✅ Frontend built"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Build complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
