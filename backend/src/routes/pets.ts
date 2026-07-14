import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, breed, size } = req.body;
  try {
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (breed !== undefined) data.breed = breed;
    if (size !== undefined) data.size = size;
    const pet = await prisma.pet.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(pet);
  } catch {
    res.status(404).json({ error: 'Pet not found' });
  }
});

export default router;
