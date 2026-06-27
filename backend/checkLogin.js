const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'developer@glanzgroom.de';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found!');
    return;
  }
  const isValid = await bcrypt.compare('developer123', user.password);
  console.log('User found:', user.email);
  console.log('Is password developer123 valid?', isValid);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
