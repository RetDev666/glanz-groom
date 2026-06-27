import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hashedPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@glanzgroom.ua' },
    update: {},
    create: { email: 'admin@glanzgroom.ua', password: hashedPass, name: 'Admin', role: 'admin' },
  });

  // Groomers
  const groomers = [
    { name: 'Олена Р.', role: 'Старший грумер', color: '#f56a6a' },
    { name: 'Марк Д.', role: 'Купальник & Підготовка', color: '#42b5a9' },
    { name: 'Сара К.', role: 'Стиліст', color: '#ffc627' },
  ];
  for (const g of groomers) {
    await prisma.groomer.upsert({
      where: { id: groomers.indexOf(g) + 1 },
      update: {},
      create: g,
    });
  }

  // Wipe old services (since we changed the schema completely)
  await prisma.appointmentService.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.service.deleteMany({});
  
  // Services
  const services = [
    // Packages
    {
      name: 'Wellness Paket – mit Haarschnitt',
      nameUk: 'Велнес Пакет – зі стрижкою',
      description: 'Повне купання, стрижка за породою',
      category: 'package',
      priceXs: 90, priceS: 120, priceM: 140, priceL: 155, priceXl: 185,
      durationXs: 90, durationS: 120, durationM: 140, durationL: 155, durationXl: 185,
    },
    {
      name: 'Wellness Paket – für Unterwolle',
      nameUk: 'Велнес Пакет – для підшерстя',
      description: 'Глибока обробка для зменшення линьки',
      category: 'package',
      priceXs: 88, priceS: 105, priceM: 122, priceL: 138, priceXl: 171,
      durationXs: 80, durationS: 100, durationM: 110, durationL: 130, durationXl: 160,
    },
    {
      name: 'Hygiene Paket – für kurzhaarige Hunde',
      nameUk: 'Гігієнічний Пакет (коротка шерсть)',
      description: 'Гігієнічний догляд для короткошерстих порід',
      category: 'package',
      priceXs: 48, priceS: 65, priceM: 82, priceL: 100, priceXl: 128,
      durationXs: 40, durationS: 60, durationM: 80, durationL: 100, durationXl: 120,
    },
    {
      name: 'Hygiene Paket für langhaar',
      nameUk: 'Гігієнічний Пакет (довга шерсть)',
      description: 'Гігієнічний догляд для довгошерстих порід',
      category: 'package',
      priceXs: 65, priceS: 95, priceM: 117, priceL: 130, priceXl: 158,
      durationXs: 60, durationS: 80, durationM: 100, durationL: 125, durationXl: 150,
    },
    {
      name: 'Handstripping Paket ohne baden',
      nameUk: 'Тримінг (без купання)',
      description: 'Тримінг для жорсткошерстих порід без миття',
      category: 'package',
      priceXs: 60, priceS: 80, priceM: 100, priceL: 130, priceXl: 150,
      durationXs: 50, durationS: 65, durationM: 85, durationL: 110, durationXl: 130,
    },
    {
      name: 'Handstripping Paket mit baden',
      nameUk: 'Тримінг (з купанням)',
      description: 'Тримінг з наступним миттям та сушінням',
      category: 'package',
      priceXs: 102, priceS: 130, priceM: 150, priceL: 180, priceXl: 210,
      durationXs: 90, durationS: 120, durationM: 150, durationL: 170, durationXl: 200,
    },
    {
      name: 'Welpeneingewöhnung lang haar',
      nameUk: 'Знайомство для цуценят (довга шерсть)',
      description: 'Адаптаційний візит для цуценят з довгою шерстю',
      category: 'package',
      priceXs: 44, priceS: 44, priceM: 44, priceL: 44, priceXl: 44,
      durationXs: 40, durationS: 40, durationM: 40, durationL: 40, durationXl: 40,
    },
    {
      name: 'Welpeneingewöhnung kurz haar',
      nameUk: 'Знайомство для цуценят (коротка шерсть)',
      description: 'Адаптаційний візит для цуценят з короткою шерстю',
      category: 'package',
      priceXs: 25, priceS: 25, priceM: 25, priceL: 25, priceXl: 25,
      durationXs: 20, durationS: 20, durationM: 20, durationL: 20, durationXl: 20,
    },
    
    // Addons
    {
      name: 'Krallenpflege',
      nameUk: 'Догляд за кігтями (без лап)',
      description: 'Підрізання та полірування кігтів',
      category: 'addon',
      priceXs: 10, priceS: 10, priceM: 12, priceL: 15, priceXl: 15,
      durationXs: 10, durationS: 10, durationM: 10, durationL: 15, durationXl: 15,
    },
    {
      name: 'Krallenpflege mit pfotenpfleger',
      nameUk: 'Догляд за кігтями (з лапами)',
      description: 'Кігті та догляд за подушечками',
      category: 'addon',
      priceXs: 15, priceS: 15, priceM: 18, priceL: 20, priceXl: 22,
      durationXs: 15, durationS: 15, durationM: 15, durationL: 20, durationXl: 20,
    },
    {
      name: 'Zahnreinigung – Standard',
      nameUk: 'Чищення зубів – Стандарт',
      description: 'Базове чищення зубів щіткою',
      category: 'addon',
      priceXs: 10, priceS: 10, priceM: 12, priceL: 18, priceXl: 20,
      durationXs: 10, durationS: 10, durationM: 10, durationL: 15, durationXl: 15,
    },
    {
      name: 'Zahnreinigung – Ultraschall',
      nameUk: 'Чищення зубів – Ультразвук',
      description: 'Ультразвукове зняття нальоту',
      category: 'addon',
      priceXs: 35, priceS: 35, priceM: 35, priceL: 45, priceXl: 45,
      durationXs: 30, durationS: 30, durationM: 30, durationL: 40, durationXl: 40,
    },
    {
      name: 'Fellmaske',
      nameUk: 'Маска для шерсті',
      description: 'Живильна маска для зволоження',
      category: 'addon',
      priceXs: 10, priceS: 10, priceM: 15, priceL: 22, priceXl: 22,
      durationXs: 10, durationS: 10, durationM: 10, durationL: 10, durationXl: 10,
    },
    {
      name: 'Augenpflege',
      nameUk: 'Догляд за очима',
      description: 'Очищення слізних доріжок',
      category: 'addon',
      priceXs: 12, priceS: 12, priceM: 15, priceL: 18, priceXl: 18,
      durationXs: 10, durationS: 10, durationM: 10, durationL: 15, durationXl: 15,
    },
    {
      name: 'Ohrenpflege',
      nameUk: 'Догляд за вухами',
      description: 'Чищення та вищипування шерсті з вух',
      category: 'addon',
      priceXs: 12, priceS: 12, priceM: 15, priceL: 18, priceXl: 18,
      durationXs: 10, durationS: 10, durationM: 10, durationL: 15, durationXl: 15,
    },
    {
      name: 'Kleines Pflegepaket',
      nameUk: 'Малий пакет догляду',
      description: 'Швидкий догляд між основними візитами',
      category: 'addon',
      priceXs: 35, priceS: 35, priceM: 45, priceL: 50, priceXl: 50,
      durationXs: 30, durationS: 30, durationM: 35, durationL: 40, durationXl: 40,
    },
    {
      name: 'Entfilzung',
      nameUk: 'Вичісування ковтунів (30хв)',
      description: 'Бережне розплутування ковтунів',
      category: 'addon',
      priceXs: 32, priceS: 32, priceM: 32, priceL: 32, priceXl: 32,
      durationXs: 30, durationS: 30, durationM: 30, durationL: 30, durationXl: 30,
    }
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  // Sample clients
  const client1 = await prisma.client.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: { firstName: 'Сара', lastName: 'Петренко', email: 'sarah@example.com', phone: '+380441234567' },
  });
  const pet1 = await prisma.pet.upsert({
    where: { id: 1 },
    update: { size: 'l' }, // updating old sizes to new xs/s/m/l/xl format
    create: { name: 'Белла', breed: 'Golden Retriever', size: 'l', clientId: client1.id },
  });

  console.log('✅ Seeding complete!');
  console.log('📧 Admin login: admin@glanzgroom.ua / admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
