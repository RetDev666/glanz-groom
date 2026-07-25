import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { cacheGet, cacheSet, cacheInvalidate, TTL } from '../lib/cache';

const router = Router();

type SizeKey = 'xs' | 's' | 'm' | 'l' | 'xl';
type DurationField = 'durationXs' | 'durationS' | 'durationM' | 'durationL' | 'durationXl';
type PriceField = 'priceXs' | 'priceS' | 'priceM' | 'priceL' | 'priceXl';

const DURATION_FIELD: Record<SizeKey, DurationField> = {
  xs: 'durationXs', s: 'durationS', m: 'durationM', l: 'durationL', xl: 'durationXl',
};
const PRICE_FIELD: Record<SizeKey, PriceField> = {
  xs: 'priceXs', s: 'priceS', m: 'priceM', l: 'priceL', xl: 'priceXl',
};

/** Normalize pet size so "XS" / " Xs " never falls back to M/L by accident. */
function normalizeSize(size: unknown): SizeKey {
  const s = String(size ?? 'm').trim().toLowerCase();
  if (s === 'xs' || s === 's' || s === 'm' || s === 'l' || s === 'xl') return s;
  return 'm';
}

function sumServiceField(
  services: Array<Record<string, unknown>>,
  field: DurationField | PriceField
): number {
  return services.reduce((sum, svc) => sum + (Number(svc[field]) || 0), 0);
}

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
    } else if (startDate) {
      where.date = { gte: new Date(startDate as string) };
    } else if (endDate) {
      where.date = { lte: new Date(endDate as string) };
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

    // Short private cache — admin calendar/lists re-fetch often
    res.setHeader('Cache-Control', 'private, no-store');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/appointments/availability — public endpoint to check busy slots
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const { date, startDate, endDate } = req.query;
    if (!date && (!startDate || !endDate)) {
      return res.status(400).json({ error: 'Date or startDate/endDate is required' });
    }

    const cacheKey = `avail:${String(date || '')}:${String(startDate || '')}:${String(endDate || '')}`;
    const cached = cacheGet<unknown[]>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=10');
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    let dateWhere: any = {};
    if (startDate && endDate) {
      dateWhere = { gte: new Date(startDate as string), lt: new Date(endDate as string) };
    } else {
      const d = new Date(date as string);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      dateWhere = { gte: d, lt: nextDay };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        date: dateWhere,
        status: { not: 'cancelled' } // Cancelled appointments don't take up time
      },
      select: {
        groomerId: true,
        date: true,
        duration: true,
      }
    });

    cacheSet(cacheKey, appointments, TTL.SHORT);
    res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=10');
    res.setHeader('X-Cache', 'MISS');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/appointments/latest — returns the latest appointment ID for polling
router.get('/latest', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { sinceId } = req.query;

    const where: Record<string, unknown> = {};
    if (req.userRole === 'groomer' && req.groomerId) {
      where.groomerId = req.groomerId;
    }

    // Parallel: latest row (slim) + optional count for badge
    const sinceNum = sinceId && !isNaN(Number(sinceId)) ? Number(sinceId) : null;

    const [latest, newCount] = await Promise.all([
      prisma.appointment.findFirst({
        where,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          date: true,
          status: true,
          client: { select: { firstName: true, lastName: true } },
        },
      }),
      sinceNum !== null
        ? prisma.appointment.count({
            where: { ...where, id: { gt: sinceNum } },
          })
        : Promise.resolve(0),
    ]);

    res.setHeader('Cache-Control', 'private, no-store');
    res.json({
      ...(latest || { id: 0 }),
      newCount,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// POST /api/appointments/admin-create
router.post('/admin-create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      groomerId, date, duration, notes, petName, petBreed, petSize,
      clientFirstName, clientLastName, clientPhone, isBlock, serviceIds, discount,
    } = req.body;

    let finalDuration = Number(duration) || 0;
    const finalGroomerId = Number(groomerId);
    const size = normalizeSize(petSize);

    // If it's a block, we don't need a real client or pet, and status is "blocked"
    if (isBlock) {
      let client = await prisma.client.findFirst({ where: { phone: '000000000' } });
      if (!client) {
        client = await prisma.client.create({
          data: { firstName: 'System', lastName: 'Block', email: `block-${Date.now()}@local`, phone: '000000000' }
        });
      }
      let pet = await prisma.pet.findFirst({ where: { clientId: client.id, name: 'Block' } });
      if (!pet) {
        pet = await prisma.pet.create({
          data: { name: 'Block', breed: 'Unknown', size: 'm', clientId: client.id }
        });
      }

      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(date),
          duration: finalDuration > 0 ? finalDuration : 60, // default to 60m if not provided
          totalPrice: 0,
          notes: notes || 'Time blocked by admin',
          status: 'blocked',
          clientId: client.id,
          petId: pet.id,
          groomerId: finalGroomerId,
        }
      });
      cacheInvalidate('avail:');
      return res.json(appointment);
    }

    // Normal admin appointment creation — reuse existing client by phone when possible
    let client = clientPhone
      ? await prisma.client.findFirst({ where: { phone: clientPhone } })
      : null;
    if (!client) {
      client = await prisma.client.create({
        data: { 
          firstName: clientFirstName || 'Client', 
          lastName: '', 
          email: `client-${Date.now()}@local`, 
          phone: clientPhone || '000000000' 
        }
      });
    } else if (clientFirstName || clientLastName !== undefined || notes) {
      // Keep profile fresh when re-booking a known client
      const patch: Record<string, string> = {};
      if (clientFirstName && clientFirstName !== client.firstName) patch.firstName = clientFirstName;
      if (clientLastName !== undefined && String(clientLastName) !== client.lastName) {
        patch.lastName = String(clientLastName || '');
      }
      if (notes && notes !== client.notes) patch.notes = notes;
      if (Object.keys(patch).length > 0) {
        client = await prisma.client.update({ where: { id: client.id }, data: patch });
      }
    }

    let pet = await prisma.pet.findFirst({ where: { clientId: client.id, name: petName || 'Dog' } });
    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          name: petName || 'Dog',
          breed: petBreed || 'Unknown',
          size,
          clientId: client.id,
        }
      });
    } else {
      const petUpdateData: { breed?: string; size?: string } = {};
      if (petBreed && petBreed !== pet.breed) petUpdateData.breed = petBreed;
      if (size !== pet.size) petUpdateData.size = size;
      if (Object.keys(petUpdateData).length > 0) {
        pet = await prisma.pet.update({
          where: { id: pet.id },
          data: petUpdateData
        });
      }
    }

    // Calculate duration and price from services (size-aware: XS must use durationXs, not L)
    let calculatedDuration = 0;
    let calculatedPrice = 0;
    let servicesData: any[] = [];
    if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      const services = await prisma.service.findMany({ where: { id: { in: serviceIds.map(Number) } } });
      const dField = DURATION_FIELD[normalizeSize(pet.size)];
      const pField = PRICE_FIELD[normalizeSize(pet.size)];
      
      calculatedDuration = sumServiceField(services as any[], dField);
      calculatedPrice = sumServiceField(services as any[], pField);
      servicesData = services.map(s => ({ serviceId: s.id, price: Number(s[pField]) || 0 }));
    }

    // Prefer explicit duration from admin UI when provided; otherwise use calculated
    finalDuration = finalDuration > 0 ? finalDuration : calculatedDuration;
    if (finalDuration === 0) finalDuration = 60; // fallback

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        duration: finalDuration,
        totalPrice: Math.max(0, calculatedPrice - (Number(discount) || 0)),
        notes: notes || '',
        status: 'confirmed',
        clientId: client.id,
        petId: pet.id,
        groomerId: finalGroomerId,
        services: {
          create: servicesData
        }
      }
    });

    cacheInvalidate('avail:');
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

    // Create or find pet (always store normalized size: xs|s|m|l|xl)
    const size = normalizeSize(petSize);
    let pet = await prisma.pet.findFirst({ where: { clientId: client.id, name: petName } });
    if (!pet) {
      pet = await prisma.pet.create({
        data: { name: petName, breed: petBreed || 'Unknown', size, clientId: client.id },
      });
    } else {
      const petUpdateData: { breed?: string; size?: string } = {};
      if (petBreed && petBreed !== pet.breed) petUpdateData.breed = petBreed;
      if (size !== pet.size) petUpdateData.size = size;
      if (Object.keys(petUpdateData).length > 0) {
        pet = await prisma.pet.update({
          where: { id: pet.id },
          data: petUpdateData
        });
      }
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

    // Calculate price and duration from pet size + services (server is source of truth)
    const services = await prisma.service.findMany({ where: { id: { in: serviceIds.map(Number) } } });
    const petSizeKey = normalizeSize(pet.size);
    const priceField = PRICE_FIELD[petSizeKey];
    const durationField = DURATION_FIELD[petSizeKey];

    const calculatedPrice = sumServiceField(services as any[], priceField);
    const calculatedDuration = sumServiceField(services as any[], durationField);

    // Prefer server-side duration/price so client bugs (wrong size map) cannot inflate slots
    const finalPrice = calculatedPrice > 0
      ? calculatedPrice
      : (totalPrice !== undefined ? Number(totalPrice) : 0);
    const finalDuration = calculatedDuration > 0
      ? calculatedDuration
      : Math.max(Number(duration) || 60, 15);

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

    cacheInvalidate('avail:');

    try {
      const { sendPushNotification } = require('./system');
      await sendPushNotification({
        title: 'Neuer Termin!',
        body: `${client.firstName} ${client.lastName} hat für ${pet.name} gebucht.`,
        url: '/admin/appointments'
      });
    } catch (e) {}

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
    cacheInvalidate('avail:');
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// PATCH /api/appointments/:id — full update
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { 
    status, notes, groomerId, date, totalPrice, duration, petPhotoUrl, serviceIds,
    clientFirstName, clientLastName, clientPhone, clientEmail,
    petName, petBreed, petSize, discount
  } = req.body;

  try {
    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (groomerId !== undefined) data.groomerId = Number(groomerId);
    if (date !== undefined) data.date = new Date(date);
    if (totalPrice !== undefined) data.totalPrice = Number(totalPrice);
    if (duration !== undefined) data.duration = Number(duration);
    if (petPhotoUrl !== undefined) data.petPhotoUrl = petPhotoUrl;

    const appointment = await prisma.appointment.findUnique({ 
      where: { id: Number(id) }, 
      include: { pet: true, client: true } 
    });

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Update Client if provided
    if (clientFirstName !== undefined || clientLastName !== undefined || clientPhone !== undefined || clientEmail !== undefined) {
      await prisma.client.update({
        where: { id: appointment.clientId },
        data: {
          firstName: clientFirstName !== undefined ? clientFirstName : appointment.client.firstName,
          lastName: clientLastName !== undefined ? clientLastName : appointment.client.lastName,
          phone: clientPhone !== undefined ? clientPhone : appointment.client.phone,
          email: clientEmail !== undefined ? clientEmail : appointment.client.email,
        }
      });
    }

    // Update Pet if provided
    if (petName !== undefined || petBreed !== undefined || petSize !== undefined) {
      const nextSize = petSize !== undefined ? normalizeSize(petSize) : appointment.pet.size;
      await prisma.pet.update({
        where: { id: appointment.petId },
        data: {
          name: petName !== undefined ? petName : appointment.pet.name,
          breed: petBreed !== undefined ? petBreed : appointment.pet.breed,
          size: nextSize,
        }
      });
      // update local reference to ensure pricing uses new size if updated
      if (petSize !== undefined) appointment.pet.size = nextSize;
    }

    const sizeKey = normalizeSize(appointment.pet.size);

    if (serviceIds && Array.isArray(serviceIds)) {
      // Delete old services
      await prisma.appointmentService.deleteMany({ where: { appointmentId: Number(id) } });
      
      const services = await prisma.service.findMany({ where: { id: { in: serviceIds.map(Number) } } });
      const priceField = PRICE_FIELD[sizeKey];
      const durationField = DURATION_FIELD[sizeKey];
      
      data.services = {
        create: services.map(s => ({ serviceId: s.id, price: s[priceField] })),
      };

      // Recalculate totalPrice if not explicitly provided, taking discount into account
      if (totalPrice === undefined) {
        const sum = sumServiceField(services as any[], priceField);
        data.totalPrice = Math.max(0, sum - (Number(discount) || 0));
      }

      // Recalculate duration when services change unless caller set an explicit duration
      // (calendar resize sends only { duration } without serviceIds — that path is untouched)
      if (duration === undefined) {
        const sumDur = sumServiceField(services as any[], durationField);
        if (sumDur > 0) data.duration = sumDur;
      }
    } else if (discount !== undefined && totalPrice === undefined) {
       // If services didn't change but discount changed, recalculate
       const currentServices = await prisma.appointmentService.findMany({ where: { appointmentId: Number(id) } });
       const sum = currentServices.reduce((acc, s) => acc + s.price, 0);
       data.totalPrice = Math.max(0, sum - Number(discount));
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

    cacheInvalidate('avail:');
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
    cacheInvalidate('avail:');
    
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
