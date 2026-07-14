import { Router, Request, Response, RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Middleware to check if user is developer
const requireDeveloper: RequestHandler = (req, res, next) => {
  const userRole = (req as any).userRole;
  if (userRole !== 'developer') {
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

import webpush from 'web-push';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// POST /api/system/push-subscribe
router.post('/push-subscribe', async (req: Request, res: Response) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    res.status(400).json({ error: 'Invalid subscription' });
    return;
  }
  
  try {
    let setting = await prisma.setting.findUnique({ where: { key: 'push_subscriptions' } });
    let subs: any[] = [];
    if (setting) {
      subs = JSON.parse(setting.value);
    }
    
    // Check if already exists
    if (!subs.find(s => s.endpoint === subscription.endpoint)) {
      subs.push(subscription);
      await prisma.setting.upsert({
        where: { key: 'push_subscriptions' },
        update: { value: JSON.stringify(subs) },
        create: { key: 'push_subscriptions', value: JSON.stringify(subs) }
      });
    }
    res.status(201).json({});
  } catch (e) {
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

export const sendPushNotification = async (payload: any) => {
  if (!process.env.VAPID_PUBLIC_KEY) return;
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'push_subscriptions' } });
    if (!setting) return;
    const subs: any[] = JSON.parse(setting.value);
    const validSubs = [];
    
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
        validSubs.push(sub);
      } catch (e: any) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          // expired subscription, remove it
        } else {
          validSubs.push(sub);
        }
      }
    }
    
    // update to remove expired
    if (validSubs.length !== subs.length) {
      await prisma.setting.update({
        where: { key: 'push_subscriptions' },
        data: { value: JSON.stringify(validSubs) }
      });
    }
  } catch (e) {
    console.error('Push error', e);
  }
};

export default router;
