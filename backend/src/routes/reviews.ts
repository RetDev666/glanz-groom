import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ─── Google Places API helper ────────────────────────────────────────────────
const fetchGoogleReviews = async (): Promise<any[]> => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    throw new Error('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&language=de&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API error: ${res.status}`);

  const data: any = await res.json();
  if (data.status !== 'OK') throw new Error(`Google Places status: ${data.status} — ${data.error_message || ''}`);

  return data.result?.reviews || [];
};

// ─── GET /api/reviews — публічний, повертає кешовані відгуки ─────────────────
router.get('/', async (req, res) => {
  try {
    const reviews = await prisma.googleReview.findMany({
      where: { isVisible: true },
      orderBy: { time: 'desc' },
      take: 6
    });

    if (reviews.length > 0) {
      return res.json(reviews);
    }

    // Якщо кеш порожній — спробуємо підтягнути з Google
    try {
      const googleReviews = await fetchGoogleReviews();
      const saved = await syncReviewsToDB(googleReviews);
      return res.json(saved);
    } catch (googleErr: any) {
      console.warn('Google API not available, returning empty:', googleErr.message);
      return res.json([]);
    }
  } catch (err: any) {
    console.error('Reviews GET error:', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// ─── POST /api/reviews/sync — адмін: синхронізація з Google ──────────────────
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const googleReviews = await fetchGoogleReviews();
    const saved = await syncReviewsToDB(googleReviews);
    res.json({ synced: saved.length, reviews: saved });
  } catch (err: any) {
    console.error('Reviews sync error:', err.message);
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// ─── PUT /api/reviews/:id/visibility — адмін: показати/сховати відгук ────────
router.put('/:id/visibility', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;
    const updated = await prisma.googleReview.update({
      where: { id },
      data: { isVisible: Boolean(isVisible) }
    });
    res.json(updated);
  } catch (err: any) {
    console.error('Review visibility error:', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// ─── Хелпер: зберігає/оновлює відгуки в БД ──────────────────────────────────
async function syncReviewsToDB(googleReviews: any[]) {
  const results = [];

  for (const r of googleReviews) {
    if (!r.text || r.rating < 4) continue; // Тільки 4-5 зірок

    const id = `${r.author_name}_${r.time}`.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 50);

    const review = await prisma.googleReview.upsert({
      where: { id },
      update: {
        authorName: r.author_name,
        authorPhoto: r.profile_photo_url || null,
        rating: r.rating,
        text: r.text,
        time: new Date(r.time * 1000),
        syncedAt: new Date()
      },
      create: {
        id,
        authorName: r.author_name,
        authorPhoto: r.profile_photo_url || null,
        rating: r.rating,
        text: r.text,
        time: new Date(r.time * 1000),
        isVisible: true
      }
    });

    results.push(review);
  }

  return results;
}

export default router;
