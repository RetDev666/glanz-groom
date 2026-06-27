import { Router, Request, Response, RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Middleware to check if user is developer
const requireDeveloper: RequestHandler = (req, res, next) => {
  const user = (req as any).user;
  if (!user || user.role !== 'developer') {
    res.status(403).json({ error: 'Access denied: Developer only' });
    return;
  }
  next();
};

// GET /api/system/backup
router.get('/backup', requireAuth, requireDeveloper, (req: Request, res: Response) => {
  const dbPath = path.resolve(__dirname, '../../prisma/dev.db');
  if (fs.existsSync(dbPath)) {
    res.download(dbPath, `backup-${new Date().toISOString().split('T')[0]}.db`);
  } else {
    res.status(404).json({ error: 'Database file not found' });
  }
});

// GET /api/system/audit
router.get('/audit', requireAuth, requireDeveloper, async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 logs
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
