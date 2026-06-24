import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: GET all active services
router.get('/', async (_req: Request, res: Response) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { priceM: 'asc' }],
  });
  res.json(services);
});

// Admin: GET all services (including inactive)
router.get('/all', requireAuth, async (_req: AuthRequest, res: Response) => {
  const services = await prisma.service.findMany({
    orderBy: [{ category: 'asc' }, { priceM: 'asc' }],
  });
  res.json(services);
});

// POST — create service
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const {
    name, nameUk, description, category,
    priceXs, priceS, priceM, priceL, priceXl,
    durationXs, durationS, durationM, durationL, durationXl,
  } = req.body;

  try {
    const service = await prisma.service.create({
      data: {
        name, nameUk, description, category,
        priceXs: Number(priceXs), priceS: Number(priceS), priceM: Number(priceM),
        priceL: Number(priceL), priceXl: Number(priceXl),
        durationXs: Number(durationXs), durationS: Number(durationS), durationM: Number(durationM),
        durationL: Number(durationL), durationXl: Number(durationXl),
        isActive: true,
      },
    });
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /:id — update service
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const {
    name, nameUk, description, category, isActive,
    priceXs, priceS, priceM, priceL, priceXl,
    durationXs, durationS, durationM, durationL, durationXl,
  } = req.body;

  try {
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (nameUk !== undefined) data.nameUk = nameUk;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (isActive !== undefined) data.isActive = isActive;
    if (priceXs !== undefined) data.priceXs = Number(priceXs);
    if (priceS !== undefined) data.priceS = Number(priceS);
    if (priceM !== undefined) data.priceM = Number(priceM);
    if (priceL !== undefined) data.priceL = Number(priceL);
    if (priceXl !== undefined) data.priceXl = Number(priceXl);
    if (durationXs !== undefined) data.durationXs = Number(durationXs);
    if (durationS !== undefined) data.durationS = Number(durationS);
    if (durationM !== undefined) data.durationM = Number(durationM);
    if (durationL !== undefined) data.durationL = Number(durationL);
    if (durationXl !== undefined) data.durationXl = Number(durationXl);

    const s = await prisma.service.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(s);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

// DELETE /:id — soft delete (set isActive: false)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.service.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
