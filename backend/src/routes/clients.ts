import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (_req: AuthRequest, res: Response) => {
  const clients = await prisma.client.findMany({
    include: { pets: true, _count: { select: { appointments: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(clients);
});

/** Quick lookup for calendar booking — match phone / name / email */
router.get('/search', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return res.json([]);
    }

    // Digits-only form helps match phones typed with spaces (+49 176 …)
    const digits = q.replace(/\D/g, '');
    const or: Array<Record<string, unknown>> = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
    ];
    if (digits.length >= 3) {
      or.push({ phone: { contains: digits } });
    }

    const clients = await prisma.client.findMany({
      where: { OR: or },
      include: { pets: true },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
    res.json(clients);
  } catch {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const client = await prisma.client.findUnique({
    where: { id: Number(req.params.id) },
    include: { pets: true, appointments: { include: { services: { include: { service: true } }, groomer: true } } },
  });
  if (!client) return res.status(404).json({ error: 'Not found' });
  res.json(client);
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, email, phone, notes } = req.body;
  try {
    const client = await prisma.client.create({ data: { firstName, lastName, email, phone, notes } });
    res.status(201).json(client);
  } catch {
    res.status(400).json({ error: 'Client already exists or invalid data' });
  }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, email, phone, notes } = req.body;
  try {
    const client = await prisma.client.update({
      where: { id: Number(req.params.id) },
      data: { firstName, lastName, email, phone, notes },
    });
    res.json(client);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, email, phone, notes } = req.body;
  try {
    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (notes !== undefined) data.notes = notes;
    const client = await prisma.client.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(client);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
