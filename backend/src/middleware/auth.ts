import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
  groomerId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string; groomerId?: number };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.groomerId = decoded.groomerId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
