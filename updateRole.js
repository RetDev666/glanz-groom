const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Current Users:");
  console.log(users);

  if (users.length > 0) {
    const mainUser = users[0];
    await prisma.user.update({
      where: { id: mainUser.id },
      data: { role: 'developer' }
    });
    console.log(`Updated user ${mainUser.email} to developer role.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
