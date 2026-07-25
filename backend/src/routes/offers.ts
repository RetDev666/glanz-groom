import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { cacheGet, cacheSet, cacheInvalidate, TTL } from '../lib/cache';

const router = Router();


// Get all offers
router.get('/', async (req, res) => {
  try {
    const cached = cacheGet<unknown[]>('offers:all');
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=20, s-maxage=60, stale-while-revalidate=120');
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const offers = await prisma.offer.findMany({
      orderBy: { id: 'asc' }
    });

    cacheSet('offers:all', offers, TTL.LONG);
    res.setHeader('Cache-Control', 'public, max-age=20, s-maxage=60, stale-while-revalidate=120');
    res.setHeader('X-Cache', 'MISS');
    res.json(offers);
  } catch (error) {
    console.error('Offers GET error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new offer
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, desc, value, cta, imageUrl, badge, isActive } = req.body;
    if (!title || !value) {
      return res.status(400).json({ error: 'Title and value are required' });
    }
    const newOffer = await prisma.offer.create({
      data: {
        title: String(title),
        desc: desc ? String(desc) : '',
        value: String(value),
        cta: cta ? String(cta) : 'Termin anfragen',
        imageUrl: imageUrl || null,
        badge: badge || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });
    cacheInvalidate('offers:');
    res.status(201).json(newOffer);
  } catch (error: any) {
    console.error('Offers POST error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Update offer
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const { title, desc, value, cta, imageUrl, badge, isActive } = req.body;
    if (!title || !value) {
      return res.status(400).json({ error: 'Title and value are required' });
    }
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        title: String(title),
        desc: desc ? String(desc) : '',
        value: String(value),
        cta: cta ? String(cta) : 'Termin anfragen',
        imageUrl: imageUrl || null,
        badge: badge || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });
    cacheInvalidate('offers:');
    res.json(updatedOffer);
  } catch (error: any) {
    console.error('Offers PUT error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Delete offer
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.offer.delete({
      where: { id }
    });
    cacheInvalidate('offers:');
    res.json({ success: true });
  } catch (error) {
    console.error('Offers DELETE error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
