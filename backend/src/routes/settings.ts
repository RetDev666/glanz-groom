import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    // Convert array of {key, value} to an object {key: value}
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    res.json(settingsObj);
  } catch (error) {
    console.error('Settings GET error:', error);
    res.status(500).json({ error: 'Server error' });
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
        update: { value: data[key] },
        create: { key, value: data[key] }
      })
    );
    
    await prisma.$transaction(updates);
    
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Settings POST error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
