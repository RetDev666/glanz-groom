import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';
import cloudinary from '../lib/cloudinary';

const router = Router();

// ─── Визначаємо режим збереження ────────────────────────────────────────────
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Локальний fallback (лише для розробки)
let uploadPet: multer.Multer;
let uploadGroomer: multer.Multer;
let uploadOffer: multer.Multer;
let uploadPortfolio: multer.Multer;

if (useCloudinary) {
  // Production: зберігаємо в пам'яті, потім відправляємо в Cloudinary
  const memStorage = multer.memoryStorage();
  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Nur Bilder erlaubt (JPEG, PNG, WebP, etc.)'));
  };
  uploadPet = multer({ storage: memStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  uploadGroomer = multer({ storage: memStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  uploadOffer = multer({ storage: memStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  uploadPortfolio = multer({ storage: memStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
} else {
  // Локальна розробка: зберігаємо на диск
  const PET_UPLOAD_DIR = path.join(__dirname, '../../uploads/pets');
  const GROOMER_UPLOAD_DIR = path.join(__dirname, '../../uploads/groomers');
  const OFFER_UPLOAD_DIR = path.join(__dirname, '../../uploads/offers');
  const PORTFOLIO_UPLOAD_DIR = path.join(__dirname, '../../uploads/portfolio');
  [PET_UPLOAD_DIR, GROOMER_UPLOAD_DIR, OFFER_UPLOAD_DIR, PORTFOLIO_UPLOAD_DIR].forEach(dir => {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.warn(`Could not create directory ${dir} (expected in read-only serverless environment if Cloudinary is not configured)`);
    }
  });

  const makeStorage = (dest: string) => multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, crypto.randomBytes(32).toString('hex') + ext);
    },
  });
  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Nur Bilder erlaubt (JPEG, PNG, WebP, etc.)'));
  };
  uploadPet = multer({ storage: makeStorage(PET_UPLOAD_DIR), fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  uploadGroomer = multer({ storage: makeStorage(GROOMER_UPLOAD_DIR), fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  uploadOffer = multer({ storage: makeStorage(OFFER_UPLOAD_DIR), fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  uploadPortfolio = multer({ storage: makeStorage(PORTFOLIO_UPLOAD_DIR), fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
}

// ─── Хелпер: завантаження буферу в Cloudinary ───────────────────────────────
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `glanz-groom/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

// ─── POST /api/upload/pet-photo ──────────────────────────────────────────────
router.post('/pet-photo', uploadPet.single('photo'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Datei nicht hochgeladen' });

  try {
    let fileUrl: string;
    if (useCloudinary && req.file.buffer) {
      fileUrl = await uploadToCloudinary(req.file.buffer, 'pets');
    } else {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/pets/${req.file.filename}`;
    }
    res.json({ url: fileUrl, size: req.file.size, mimetype: req.file.mimetype });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Hochladen des Fotos' });
  }
});

// ─── POST /api/upload/groomer-photo (admin only) ─────────────────────────────
router.post('/groomer-photo', requireAuth, uploadGroomer.single('photo'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Datei nicht hochgeladen' });

  try {
    let fileUrl: string;
    if (useCloudinary && req.file.buffer) {
      fileUrl = await uploadToCloudinary(req.file.buffer, 'groomers');
    } else {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/groomers/${req.file.filename}`;
    }
    res.json({ url: fileUrl, size: req.file.size, mimetype: req.file.mimetype });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Hochladen des Fotos' });
  }
});

// ─── POST /api/upload/offer-photo (admin only) ───────────────────────────────
router.post('/offer-photo', requireAuth, uploadOffer.single('photo'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Datei nicht hochgeladen' });

  try {
    let fileUrl: string;
    if (useCloudinary && req.file.buffer) {
      fileUrl = await uploadToCloudinary(req.file.buffer, 'offers');
    } else {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/offers/${req.file.filename}`;
    }
    res.json({ url: fileUrl, size: req.file.size, mimetype: req.file.mimetype });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Hochladen des Fotos' });
  }
});

// ─── POST /api/upload/portfolio-photo (admin only) ─────────────────────────────
router.post('/portfolio-photo', requireAuth, uploadPortfolio.single('photo'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Datei nicht hochgeladen' });

  try {
    let fileUrl: string;
    if (useCloudinary && req.file.buffer) {
      fileUrl = await uploadToCloudinary(req.file.buffer, 'portfolio');
    } else {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/portfolio/${req.file.filename}`;
    }
    res.json({ url: fileUrl, size: req.file.size, mimetype: req.file.mimetype });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Hochladen des Fotos' });
  }
});

// ─── Error handler ────────────────────────────────────────────────────────────
router.use((err: Error, _req: Request, res: Response, _next: unknown) => {
  if (err.message.includes('File too large') || err.message.includes('5MB')) {
    return res.status(400).json({ error: 'Datei zu groß. Maximum 5MB.' });
  }
  return res.status(400).json({ error: err.message });
});

export default router;
