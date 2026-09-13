import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_CATEGORIES } from '../src/lib/categories';

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL;
  const ownerPassword = process.env.OWNER_PASSWORD;
  const ownerName = process.env.OWNER_NAME ?? 'Dip';

  const monitorEmail = process.env.MONITOR_EMAIL;
  const monitorPassword = process.env.MONITOR_PASSWORD;
  const monitorName = process.env.MONITOR_NAME ?? 'Wife';

  if (!ownerEmail || !ownerPassword || !monitorEmail || !monitorPassword) {
    throw new Error(
      'Missing OWNER_EMAIL / OWNER_PASSWORD / MONITOR_EMAIL / MONITOR_PASSWORD in your environment. Set these before seeding.'
    );
  }

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail.toLowerCase() },
    update: {},
    create: {
      email: ownerEmail.toLowerCase(),
      name: ownerName,
      role: 'OWNER',
      passwordHash: await bcrypt.hash(ownerPassword, 12),
    },
  });

  await prisma.user.upsert({
    where: { email: monitorEmail.toLowerCase() },
    update: {},
    create: {
      email: monitorEmail.toLowerCase(),
      name: monitorName,
      role: 'MONITOR',
      passwordHash: await bcrypt.hash(monitorPassword, 12),
    },
  });

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { key: cat.key },
      update: {},
      create: { ...cat, isDefault: true },
    });
  }

  const foodCategory = await prisma.category.findUnique({ where: { key: 'food' } });
  const travelCategory = await prisma.category.findUnique({ where: { key: 'travel' } });
  const shoppingCategory = await prisma.category.findUnique({ where: { key: 'shopping' } });

  if (foodCategory && travelCategory && shoppingCategory) {
    const existingQuickActions = await prisma.quickAction.count({ where: { userId: owner.id } });
    if (existingQuickActions === 0) {
      await prisma.quickAction.createMany({
        data: [
          { userId: owner.id, label: 'Lunch', amount: 100, categoryId: foodCategory.id, order: 1 },
          { userId: owner.id, label: 'Commute', amount: 50, categoryId: travelCategory.id, order: 2 },
          { userId: owner.id, label: 'Groceries', amount: 200, categoryId: shoppingCategory.id, order: 3 },
        ],
      });
    }
  }

  console.log('Seed complete.');
  console.log(`Owner login:   ${ownerEmail}`);
  console.log(`Monitor login: ${monitorEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
