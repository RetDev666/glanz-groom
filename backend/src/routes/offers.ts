import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();


// Get all offers
router.get('/', async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { id: 'asc' }
    });
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
    const newOffer = await prisma.offer.create({
      data: {
        title,
        desc,
        value,
        cta: cta || "Termin anfragen",
        imageUrl,
        badge,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json(newOffer);
  } catch (error) {
    console.error('Offers POST error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update offer
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, desc, value, cta, imageUrl, badge, isActive } = req.body;
    
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        title,
        desc,
        value,
        cta,
        imageUrl,
        badge,
        isActive
      }
    });
    res.json(updatedOffer);
  } catch (error) {
    console.error('Offers PUT error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete offer
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.offer.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Offers DELETE error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
