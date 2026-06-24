import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email та повідомлення обов\'язкові' });
  }
  try {
    const msg = await prisma.contactMessage.create({
      data: { name, email, subject: subject || 'Без теми', message },
    });
    // TODO: Send email via nodemailer if configured
    res.status(201).json({ success: true, id: msg.id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
