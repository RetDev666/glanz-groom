import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: GET all active groomers (except system)
router.get('/', async (_req: Request, res: Response) => {
  const groomers = await prisma.groomer.findMany({
    where: { isActive: true, role: { not: 'system' } },
    orderBy: { id: 'asc' },
  });
  res.json(groomers);
});

// GET all groomers (admin) — including inactive
router.get('/all', requireAuth, async (_req: AuthRequest, res: Response) => {
  const groomers = await prisma.groomer.findMany({ orderBy: { id: 'asc' } });
  res.json(groomers);
});

// POST — create groomer
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, role, color, photoUrl } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "Name and role are required" });
  }
  try {
    const groomer = await prisma.groomer.create({
      data: { name, role, color: color || '#ae2f34', photoUrl: photoUrl || null, isActive: true },
    });
    res.status(201).json(groomer);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /:id — update groomer
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, role, color, isActive, photoUrl } = req.body;
  try {
    const groomer = await prisma.groomer.update({
      where: { id: Number(req.params.id) },
      data: { name, role, color, isActive, photoUrl },
    });
    res.json(groomer);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

// DELETE /:id — soft delete (set isActive: false)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.groomer.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
