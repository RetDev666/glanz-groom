import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { cacheGet, cacheSet, cacheInvalidate, TTL } from '../lib/cache';

const router = Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const cached = cacheGet<Record<string, string>>('settings:all');
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=20, stale-while-revalidate=40');
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const settings = await prisma.setting.findMany();
    // Convert array of {key, value} to an object {key: value}
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    cacheSet('settings:all', settingsObj, TTL.MEDIUM);
    res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=20, stale-while-revalidate=40');
    res.setHeader('X-Cache', 'MISS');
    res.json(settingsObj);
  } catch (error: any) {
    console.error('Settings GET error:', error);
    res.status(500).json({ error: 'Server error', details: error?.message || String(error) });
  }
});

// Update settings (Admin only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = req.body; // Expecting an object like { name: "...", address: "..." }
    
    // Update or create each setting
    const updates = Object.keys(data).map(key => 
      prisma.setting.upsert({
        where: { key },
        update: { value: String(data[key] ?? '') },
        create: { key, value: String(data[key] ?? '') }
      })
    );
    
    await prisma.$transaction(updates);
    cacheInvalidate('settings:');
    
    res.json({ message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Settings POST error:', error);
    res.status(500).json({ error: 'Server error', details: error?.message || String(error) });
  }
});

export default router;
