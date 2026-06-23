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

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.client.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
