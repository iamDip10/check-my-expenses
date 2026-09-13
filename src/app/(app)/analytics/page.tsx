import { prisma } from '@/lib/prisma';
import { getOwnerId } from '@/lib/session';
import { computeInsights } from '@/lib/insights';
import { startOfWeek, startOfMonth, endOfMonth, monthKey } from '@/lib/utils';
import { AnalyticsClient } from '@/components/owner/AnalyticsClient';

export default async function AnalyticsPage() {
  const ownerId = await getOwnerId();
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentMonthKey = monthKey(now);

  const [weekExpenses, monthExpenses, budget, activity] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: ownerId, occurredAt: { gte: weekStart } },
      include: { category: true },
      orderBy: { occurredAt: 'asc' },
    }),
    prisma.expense.findMany({
      where: { userId: ownerId, occurredAt: { gte: monthStart, lte: monthEnd } },
      include: { category: true },
      orderBy: { occurredAt: 'asc' },
    }),
    prisma.budget.findUnique({ where: { userId_month: { userId: ownerId, month: currentMonthKey } } }),
    prisma.reaction.findMany({
      where: { expense: { userId: ownerId } },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    }),
  ]);

  const { insights, wifeFeedback } = await computeInsights(ownerId);

  const tally = new Map<string, number>();
  for (const r of activity) tally.set(r.emoji, (tally.get(r.emoji) ?? 0) + 1);

  return (
    <AnalyticsClient
      weekExpenses={JSON.parse(JSON.stringify(weekExpenses))}
      monthExpenses={JSON.parse(JSON.stringify(monthExpenses))}
      budget={budget ? JSON.parse(JSON.stringify(budget)) : null}
      currentMonthKey={currentMonthKey}
      insights={insights}
      wifeFeedback={wifeFeedback}
      reactionTally={[...tally.entries()].sort((a, b) => b[1] - a[1]).map(([emoji, count]) => ({ emoji, count }))}
    />
  );
}
