import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

let prisma: PrismaClient;

if (process.env.TURSO_DATABASE_URL) {
  // Prisma 6.6+ — PrismaLibSQL приймає конфіг напряму (без createClient)
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });
  prisma = new PrismaClient({ adapter });
} else {
  // Фолбек на локальний SQLite (dev.db)
  prisma = new PrismaClient();
}

export default prisma;
