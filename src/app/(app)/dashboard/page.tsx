import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOwnerId } from '@/lib/session';
import { startOfDay, endOfDay } from '@/lib/utils';
import { OwnerDashboard } from '@/components/owner/OwnerDashboard';
import { MonitorDashboard } from '@/components/monitor/MonitorDashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;
  const ownerId = await getOwnerId();

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [todayExpenses, recentExpenses, categories, quickActions, ownerUser] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: ownerId, occurredAt: { gte: todayStart, lte: todayEnd } },
      include: { category: true, reactions: { include: { user: { select: { name: true, role: true } } } } },
      orderBy: { occurredAt: 'desc' },
    }),
    prisma.expense.findMany({
      where: { userId: ownerId },
      include: { category: true, reactions: { include: { user: { select: { name: true, role: true } } } } },
      orderBy: { occurredAt: 'desc' },
      take: 15,
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.quickAction.findMany({ where: { userId: ownerId }, include: { category: true }, orderBy: { order: 'asc' } }),
    prisma.user.findUnique({ where: { id: ownerId }, select: { name: true } }),
  ]);

  const serializable = (list: any[]) => JSON.parse(JSON.stringify(list));

  if (user.role === 'OWNER') {
    return (
      <OwnerDashboard
        initialTodayExpenses={serializable(todayExpenses)}
        categories={serializable(categories)}
        quickActions={serializable(quickActions)}
        ownerName={ownerUser?.name ?? 'Dip'}
      />
    );
  }

  return (
    <MonitorDashboard
      initialTodayExpenses={serializable(todayExpenses)}
      recentExpenses={serializable(recentExpenses)}
      monitorUserId={user.id}
      ownerName={ownerUser?.name ?? 'Dip'}
    />
  );
}
