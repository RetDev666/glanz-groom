import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all portfolio items
router.get('/', async (req, res) => {
  try {
    const items = await prisma.portfolio.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(items);
  } catch (error) {
    console.error('Portfolio GET error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new portfolio item
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, beforeUrl, afterUrl, isActive } = req.body;
    if (!afterUrl) {
      return res.status(400).json({ error: 'afterUrl is required' });
    }
    const newItem = await prisma.portfolio.create({
      data: {
        title: title ? String(title) : null,
        beforeUrl: beforeUrl || null,
        afterUrl: String(afterUrl),
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });
    res.status(201).json(newItem);
  } catch (error: any) {
    console.error('Portfolio POST error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Update portfolio item
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const { title, beforeUrl, afterUrl, isActive } = req.body;
    if (!afterUrl) {
      return res.status(400).json({ error: 'afterUrl is required' });
    }
    const updatedItem = await prisma.portfolio.update({
      where: { id },
      data: {
        title: title ? String(title) : null,
        beforeUrl: beforeUrl || null,
        afterUrl: String(afterUrl),
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });
    res.json(updatedItem);
  } catch (error: any) {
    console.error('Portfolio PUT error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Delete portfolio item
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.portfolio.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Portfolio DELETE error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
