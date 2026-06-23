import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

// Завжди використовуємо Turso у цьому проекті
const url = process.env.TURSO_DATABASE_URL || 'libsql://dummy-url-to-prevent-crash.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'dummy-token';

const libsql = createClient({
  url,
  authToken,
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter } as any);

export default prisma;
