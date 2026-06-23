#!/bin/bash
# Netlify Build Script — Glanz & Groom CRM
# Запускається автоматично при кожному деплої
set -e  # зупинитись при будь-якій помилці

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🐾 Glanz & Groom — Netlify Build Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Кореневі залежності (потрібні для Netlify Functions) ─────────────────
echo "📦 [1/5] Installing root dependencies..."
npm install
echo "✅ Root dependencies installed"
echo ""

# ── 2. Prisma: генерація клієнта ────────────────────────────────────────────
echo "🔧 [2/5] Generating Prisma client..."
npx prisma generate --schema=backend/prisma/schema.prisma
echo "✅ Prisma client generated"
echo ""

# ── 3. Prisma: push схеми до Turso (якщо є credentials) ────────────────────
echo "🗄️  [3/5] Database setup..."
if [ -n "$TURSO_DATABASE_URL" ] && [ -n "$TURSO_AUTH_TOKEN" ]; then
  echo "    Turso credentials found — pushing schema..."
  # Формуємо DATABASE_URL з окремих змінних для Prisma CLI
  export DATABASE_URL="${TURSO_DATABASE_URL}?authToken=${TURSO_AUTH_TOKEN}"
  npx prisma db push \
    --schema=backend/prisma/schema.prisma \
    --skip-generate \
    --accept-data-loss
  echo "✅ Database schema pushed to Turso"
else
  echo "⚠️  TURSO_DATABASE_URL / TURSO_AUTH_TOKEN not set"
  echo "    Skipping db push (set env vars in Netlify Dashboard)"
fi
echo ""

# ── 4. Admin: статичний білд → копіювання в frontend/public/admin/ ──────────
echo "🔨 [4/5] Building admin panel..."
npm --prefix admin install
NEXT_PUBLIC_API_URL=/api npm --prefix admin run build
mkdir -p frontend/public/admin
cp -r admin/out/. frontend/public/admin/
echo "✅ Admin panel built → frontend/public/admin/"
echo ""

# ── 5. Frontend: Next.js білд ───────────────────────────────────────────────
echo "🌐 [5/5] Building frontend..."
cd frontend
npm run build
echo "✅ Frontend built"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Build complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
