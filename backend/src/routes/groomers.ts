import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
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
  const groomers = await prisma.groomer.findMany({ 
    orderBy: { id: 'asc' },
    include: { user: { select: { email: true } } }
  });
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
      data: { name, role, color: color || '#f56a6a', photoUrl: photoUrl || null, isActive: true },
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

// POST /:id/account — create user account for groomer
router.post('/:id/account', requireAuth, async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const groomerId = Number(req.params.id);

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const groomer = await prisma.groomer.findUnique({ where: { id: groomerId } });
    if (!groomer) return res.status(404).json({ error: 'Groomer not found' });

    if (groomer.userId) {
      return res.status(400).json({ error: 'Groomer already has an account' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: groomer.name,
        role: 'groomer',
      }
    });

    await prisma.groomer.update({
      where: { id: groomerId },
      data: { userId: user.id }
    });

    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
