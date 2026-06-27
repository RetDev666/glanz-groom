import { Router, Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { logAudit } from '../utils/audit';

const router = Router();

const requireDeveloper: RequestHandler = (req, res, next) => {
  const user = (req as any).user;
  if (!user || user.role !== 'developer') {
    res.status(403).json({ error: 'Access denied: Developer only' });
    return;
  }
  next();
};

// GET /api/admins
router.get('/', requireAuth, requireDeveloper, async (req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'developer'] } },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admins
router.post('/', requireAuth, requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin',
      },
    });

    await logAudit(req, 'CREATE_ADMIN', `Admin created: ${email}`);

    res.json({ id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admins/:id
router.delete('/:id', requireAuth, requireDeveloper, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const adminToDelete = await prisma.user.findUnique({ where: { id } });
    if (!adminToDelete) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }
    if (adminToDelete.role === 'developer') {
      res.status(403).json({ error: 'Cannot delete a developer account' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    await logAudit(req, 'DELETE_ADMIN', `Admin deleted: ${adminToDelete.email}`);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
