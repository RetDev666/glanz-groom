import prisma from '../lib/prisma';
import { Request } from 'express';

export async function logAudit(req: Request, action: string, details?: string) {
  try {
    const user = (req as any).user;
    let userId = null;
    let userEmail = null;
    if (user) {
      userId = user.id;
      userEmail = user.email;
    }
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        action,
        details,
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
