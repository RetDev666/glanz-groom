import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

let prisma: PrismaClient;

if (process.env.TURSO_DATABASE_URL) {
  // Використовуємо Turso, якщо налаштовано
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter } as any);
} else {
  // Фолбек на локальний SQLite (dev.db)
  prisma = new PrismaClient();
}

export default prisma;
