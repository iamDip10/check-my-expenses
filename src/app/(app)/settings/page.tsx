import { prisma } from '@/lib/prisma';
import { getOwnerId } from '@/lib/session';
import { SettingsClient } from '@/components/owner/SettingsClient';

export default async function SettingsPage() {
  const ownerId = await getOwnerId();
  const [categories, quickActions] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.quickAction.findMany({ where: { userId: ownerId }, include: { category: true }, orderBy: { order: 'asc' } }),
  ]);

  return (
    <SettingsClient
      categories={JSON.parse(JSON.stringify(categories))}
      quickActions={JSON.parse(JSON.stringify(quickActions))}
    />
  );
}
