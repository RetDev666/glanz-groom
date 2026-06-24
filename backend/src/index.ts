import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import prisma from './lib/prisma';

import authRouter from './routes/auth';
import appointmentsRouter from './routes/appointments';
import clientsRouter from './routes/clients';
import servicesRouter from './routes/services';
import groomersRouter from './routes/groomers';
import contactRouter from './routes/contact';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';
import offersRoutes from './routes/offers';
import reviewsRoutes from './routes/reviews';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3002',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving для локальної розробки (в production використовується Cloudinary)
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/groomers', groomersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/reviews', reviewsRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Запускаємо HTTP сервер тільки при локальному запуску (не в Netlify Functions)
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`🐾 Glanz & Groom API running on http://localhost:${PORT}`);

    try {
      const systemGroomer = await prisma.groomer.findFirst({ where: { role: 'system' } });
      if (!systemGroomer) {
        await prisma.groomer.create({
          data: {
            name: 'Лист очікування',
            role: 'system',
            color: '#6b7280',
            isActive: true
          }
        });
        console.log('🐾 System groomer "Лист очікування" created');
      }
    } catch (err) {
      console.error('Failed to initialize system groomer:', err);
    }
  });
}

export default app;
