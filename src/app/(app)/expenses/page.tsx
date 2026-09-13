import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOwnerId } from '@/lib/session';
import { ExpensesPageClient } from '@/components/ExpensesPageClient';

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;
  const ownerId = await getOwnerId();

  const [expenses, categories] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: ownerId },
      include: { category: true, reactions: { include: { user: { select: { name: true, role: true } } } } },
      orderBy: { occurredAt: 'desc' },
      take: 300,
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ]);

  return (
    <ExpensesPageClient
      initialExpenses={JSON.parse(JSON.stringify(expenses))}
      categories={JSON.parse(JSON.stringify(categories))}
      role={user.role}
      monitorUserId={user.role === 'MONITOR' ? user.id : undefined}
    />
  );
}
