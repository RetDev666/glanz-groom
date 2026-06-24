# 🚀 Інструкція з деплою на Netlify

## Що і куди деплоюється

| Компонент | Хостинг | URL |
|---|---|---|
| Публічний сайт + API | Netlify Site #1 | `https://glanz-groom.netlify.app` |
| Адмін-панель | Netlify Site #2 | `https://glanz-groom-admin.netlify.app` |
| База даних (SQLite) | Turso | `libsql://....turso.io` |
| Фото тварин/грумерів | Cloudinary | `res.cloudinary.com/...` |

---

## Крок 1 — Реєстрація на Turso (БД)

1. Відкрити **https://turso.tech** → Sign Up (безкоштовно)
2. Встановити Turso CLI:
   ```bash
   # Windows (PowerShell):
   winget install ChiselStrike.Turso
   ```
3. Увійти і створити БД:
   ```bash
   turso auth login
   turso db create glanz-groom
   turso db show glanz-groom
   ```
4. Отримати токен:
   ```bash
   turso db tokens create glanz-groom
   ```
5. Зберегти два значення:
   - **URL**: `libsql://glanz-groom-XXXX.turso.io`
   - **Token**: довгий рядок

---

## Крок 2 — Реєстрація на Cloudinary (фото)

1. Відкрити **https://cloudinary.com** → Sign Up (безкоштовно)
2. Після входу → Dashboard → скопіювати:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Крок 3 — Migrate БД на Turso

В папці backend (cmd.exe):
```bash
cd backend
set TURSO_DATABASE_URL=libsql://your-db.turso.io
set TURSO_AUTH_TOKEN=your-token-here
set DATABASE_URL=libsql://your-db.turso.io
npx prisma db push
```

---

## Крок 4 — Завантажити на GitHub

```bash
git init
git add .
git commit -m "feat: prepare for Netlify deployment"
git remote add origin https://github.com/YOUR-USER/glanz-groom.git
git push -u origin main
```

---

## Крок 5 — Netlify Site #1 (Frontend + API)

1. **https://app.netlify.com** → **Add new site** → **Import an existing project**
2. GitHub → вибрати репозиторій
3. Налаштування збірки:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`
4. **Site settings → Environment variables**:

   | Змінна | Значення |
   |---|---|
   | `TURSO_DATABASE_URL` | `libsql://glanz-groom-XXXX.turso.io` |
   | `TURSO_AUTH_TOKEN` | Ваш токен Turso |
   | `DATABASE_URL` | `libsql://glanz-groom-XXXX.turso.io` |
   | `JWT_SECRET` | Будь-який довгий рядок (мін. 32 символи) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | `https://YOUR-SITE-NAME.netlify.app` |
   | `ADMIN_URL` | `https://YOUR-ADMIN-SITE.netlify.app` |
   | `CLOUDINARY_CLOUD_NAME` | З Cloudinary Dashboard |
   | `CLOUDINARY_API_KEY` | З Cloudinary Dashboard |
   | `CLOUDINARY_API_SECRET` | З Cloudinary Dashboard |
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-SITE-NAME.netlify.app/api` |
   | `CONTACT_EMAIL` | Email для повідомлень (опційно) |

---

## Крок 6 — Netlify Site #2 (Admin)

1. **Add new site** → знову той самий репозиторій
2. Збірка:
   - **Base directory**: `admin`
   - **Build command**: `npm run build`
   - **Publish directory**: `admin/.next`
3. **Environment variables**:

   | Змінна | Значення |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-SITE-NAME.netlify.app/api` |

---

## Крок 7 — Перевірка

```
https://glanz-groom.netlify.app/api/health  → {"status":"ok"}
https://glanz-groom.netlify.app             → публічний сайт
https://glanz-groom-admin.netlify.app       → адмін-панель
```

---

## Оновлення в майбутньому

Кожен `git push` автоматично тригерить новий деплой на Netlify.
