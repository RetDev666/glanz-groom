const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'developer@glanzgroom.de';
  const password = await bcrypt.hash('developer123', 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password, role: 'developer', name: 'Розробник' },
    create: { email, password, role: 'developer', name: 'Розробник' }
  });
  console.log('Developer account created:', user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
