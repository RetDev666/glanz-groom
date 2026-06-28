import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/appointments
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { date, startDate, endDate, groomerId, status } = req.query;
    const where: Record<string, unknown> = {};

    if (status && status !== 'all') where.status = status as string;
    
    if (req.userRole === 'groomer' && req.groomerId) {
      where.groomerId = req.groomerId;
    } else if (groomerId) {
      where.groomerId = Number(groomerId);
    }
    
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    } else if (date) {
      const d = new Date(date as string);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        pet: true,
        groomer: true,
        services: { include: { service: true } },
      },
      orderBy: { date: 'asc' },
    });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/appointments/availability — public endpoint to check busy slots
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const d = new Date(date as string);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: d, lt: nextDay },
        status: { not: 'cancelled' } // Cancelled appointments don't take up time
      },
      select: {
        groomerId: true,
        date: true,
        duration: true,
      }
    });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/appointments/latest — returns the latest appointment ID for polling
router.get('/latest', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { sinceId } = req.query;
    
    const latest = await prisma.appointment.findFirst({
      orderBy: { id: 'desc' },
      include: { client: true }
    });

    let newCount = 0;
    if (sinceId && !isNaN(Number(sinceId))) {
      newCount = await prisma.appointment.count({
        where: { id: { gt: Number(sinceId) } }
      });
    }

    res.json({
      ...(latest || { id: 0 }),
      newCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// POST /api/appointments/admin-create
router.post('/admin-create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { groomerId, date, duration, notes, petName, petSize, clientFirstName, clientPhone } = req.body;

    let client = await prisma.client.findFirst({ where: { phone: clientPhone } });
    if (!client) {
      client = await prisma.client.create({
        data: { 
          firstName: clientFirstName || 'System', 
          lastName: 'Block', 
          email: `system-${Date.now()}@local`, 
          phone: clientPhone || '000000000' 
        }
      });
    }

    let pet = await prisma.pet.findFirst({ where: { clientId: client.id, name: petName || 'Block' } });
    if (!pet) {
      pet = await prisma.pet.create({
        data: { name: petName || 'Block', breed: 'Unknown', size: petSize || 'm', clientId: client.id }
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        duration: Number(duration),
        totalPrice: 0,
        notes: notes || '',
        status: 'confirmed',
        clientId: client.id,
        petId: pet.id,
        groomerId: Number(groomerId),
      }
    });

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /api/appointments/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: true,
        pet: true,
        groomer: true,
        services: { include: { service: true } },
      },
    });
    if (!appointment) return res.status(404).json({ error: 'Not found' });
    res.json(appointment);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/appointments — public endpoint for booking
router.post('/', async (req: Request, res: Response) => {
  const { clientFirstName, clientLastName, clientEmail, clientPhone,
    petName, petBreed, petSize, serviceIds, groomerId, date, notes, petPhotoUrl, duration, totalPrice } = req.body;

  if (!clientPhone || !petName || !serviceIds?.length || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const finalEmail = clientEmail || `no-email-${Date.now()}@local`;
    
    // Find or create client
    let client;
    if (clientEmail) {
      client = await prisma.client.findUnique({ where: { email: clientEmail } });
    }
    if (!client) {
      client = await prisma.client.create({
        data: { firstName: clientFirstName || '', lastName: clientLastName || '',
          email: finalEmail, phone: clientPhone },
      });
    }

    // Create or find pet
    let pet = await prisma.pet.findFirst({ where: { clientId: client.id, name: petName } });
    if (!pet) {
      pet = await prisma.pet.create({
        data: { name: petName, breed: petBreed || 'Unknown', size: petSize || 'm', clientId: client.id },
      });
    } else if (petBreed && petBreed !== pet.breed) {
      pet = await prisma.pet.update({
        where: { id: pet.id },
        data: { breed: petBreed }
      });
    }

    // Find groomer
    let groomer;
    if (groomerId && Number(groomerId) === -1) {
      groomer = await prisma.groomer.findFirst({ where: { role: 'system' } });
    } else if (groomerId && Number(groomerId) > 0) {
      groomer = await prisma.groomer.findUnique({ where: { id: Number(groomerId) } });
    } else {
      groomer = await prisma.groomer.findFirst({ where: { isActive: true, role: { not: 'system' } } });
    }

    if (!groomer) return res.status(400).json({ error: 'No groomer available' });

    // Calculate price and duration
    const services = await prisma.service.findMany({ where: { id: { in: serviceIds.map(Number) } } });
    const sizeMap: Record<string, 'priceXs' | 'priceS' | 'priceM' | 'priceL' | 'priceXl'> = {
      xs: 'priceXs', s: 'priceS', m: 'priceM', l: 'priceL', xl: 'priceXl',
    };
    const durationMap: Record<string, 'durationXs' | 'durationS' | 'durationM' | 'durationL' | 'durationXl'> = {
      xs: 'durationXs', s: 'durationS', m: 'durationM', l: 'durationL', xl: 'durationXl',
    };
    const priceField = sizeMap[pet.size] || 'priceM';
    const durationField = durationMap[pet.size] || 'durationM';

    const calculatedPrice = services.reduce((sum, s) => sum + Number(s[priceField]), 0);
    const calculatedDuration = services.reduce((sum, s) => sum + Number(s[durationField]), 0);

    const finalPrice = totalPrice !== undefined ? Number(totalPrice) : calculatedPrice;
    const finalDuration = duration !== undefined ? Number(duration) : calculatedDuration;

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        petId: pet.id,
        groomerId: groomer.id,
        date: new Date(date),
        duration: finalDuration,
        totalPrice: finalPrice,
        notes: notes || '',
        petPhotoUrl: petPhotoUrl || null,
        status: 'pending',
        services: {
          create: services.map(s => ({ serviceId: s.id, price: s[priceField] })),
        },
      },
      include: { client: true, pet: true, groomer: true, services: { include: { service: true } } },
    });

    if (notes) {
      await prisma.client.update({
        where: { id: client.id },
        data: { notes }
      });
      appointment.client.notes = notes;
    }

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status },
      include: { client: true, pet: true, groomer: true, services: { include: { service: true } } },
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// PATCH /api/appointments/:id — full update
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes, groomerId, date, totalPrice, duration, petPhotoUrl, serviceIds } = req.body;

  try {
    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (groomerId !== undefined) data.groomerId = Number(groomerId);
    if (date !== undefined) data.date = new Date(date);
    if (totalPrice !== undefined) data.totalPrice = Number(totalPrice);
    if (duration !== undefined) data.duration = Number(duration);
    if (petPhotoUrl !== undefined) data.petPhotoUrl = petPhotoUrl;

    if (serviceIds && Array.isArray(serviceIds)) {
      // Delete old services
      await prisma.appointmentService.deleteMany({ where: { appointmentId: Number(id) } });
      
      // Get sizes and calculate new prices if needed
      const appointment = await prisma.appointment.findUnique({ where: { id: Number(id) }, include: { pet: true } });
      if (appointment) {
        const services = await prisma.service.findMany({ where: { id: { in: serviceIds.map(Number) } } });
        const sizeMap: Record<string, 'priceXs' | 'priceS' | 'priceM' | 'priceL' | 'priceXl'> = {
          xs: 'priceXs', s: 'priceS', m: 'priceM', l: 'priceL', xl: 'priceXl',
        };
        const priceField = sizeMap[appointment.pet.size] || 'priceM';
        
        data.services = {
          create: services.map(s => ({ serviceId: s.id, price: s[priceField] })),
        };
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: Number(id) },
      data,
      include: { client: true, pet: true, groomer: true, services: { include: { service: true } } },
    });

    if (notes !== undefined) {
      await prisma.client.update({
        where: { id: updated.clientId },
        data: { notes }
      });
      updated.client.notes = notes;
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const appointment = await prisma.appointment.findUnique({ where: { id }, include: { client: true, pet: true } });
    await prisma.appointment.delete({ where: { id } });
    
    // Import dynamically or ensure it's imported at top. Actually let's just require it here to avoid import issues at top
    const { logAudit } = require('../utils/audit');
    if (appointment) {
      await logAudit(req, 'DELETE_APPOINTMENT', `Deleted appointment for ${appointment.client.firstName} (${appointment.pet.name}) at ${appointment.date.toISOString()}`);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
