import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, formatTaka } from '@/lib/utils';

export async function computeInsights(ownerId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const monthStart = startOfMonth(now);

  const [todayExpenses, thisWeekExpenses, lastWeekExpenses, monthExpenses, recentExpenses] = await Promise.all([
    prisma.expense.findMany({ where: { userId: ownerId, occurredAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.expense.findMany({
      where: { userId: ownerId, occurredAt: { gte: thisWeekStart, lte: now } },
      include: { category: true },
    }),
    prisma.expense.findMany({
      where: { userId: ownerId, occurredAt: { gte: lastWeekStart, lt: thisWeekStart } },
      include: { category: true },
    }),
    prisma.expense.findMany({ where: { userId: ownerId, occurredAt: { gte: monthStart, lte: now } } }),
    prisma.expense.findMany({
      where: { userId: ownerId },
      orderBy: { occurredAt: 'desc' },
      take: 25,
      include: { reactions: true },
    }),
  ]);

  const insights: string[] = [];

  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const daysElapsedThisWeek = Math.max(1, now.getDay() + 1);
  const weekTotal = thisWeekExpenses.reduce((s, e) => s + e.amount, 0);
  const weeklyDailyAverage = weekTotal / daysElapsedThisWeek;

  if (weeklyDailyAverage > 0 && todayExpenses.length > 0) {
    const diffPct = Math.round(((todayTotal - weeklyDailyAverage) / weeklyDailyAverage) * 100);
    if (Math.abs(diffPct) >= 10) {
      insights.push(
        diffPct > 0
          ? `You spent ${diffPct}% more today than your weekly daily average.`
          : `You spent ${Math.abs(diffPct)}% less today than your weekly daily average.`
      );
    }
  }

  const categoryTotalsThisWeek = new Map<string, { label: string; total: number }>();
  for (const e of thisWeekExpenses) {
    const key = e.category.key;
    const entry = categoryTotalsThisWeek.get(key) ?? { label: e.category.label, total: 0 };
    entry.total += e.amount;
    categoryTotalsThisWeek.set(key, entry);
  }
  const topCategoryThisWeek = [...categoryTotalsThisWeek.values()].sort((a, b) => b.total - a.total)[0];
  if (topCategoryThisWeek) {
    insights.push(`${topCategoryThisWeek.label} is your highest spending category this week.`);
  }

  const travelThisWeek = thisWeekExpenses.filter((e) => e.category.key === 'travel').reduce((s, e) => s + e.amount, 0);
  const travelLastWeek = lastWeekExpenses.filter((e) => e.category.key === 'travel').reduce((s, e) => s + e.amount, 0);
  if (travelLastWeek > 0) {
    const diffPct = Math.round(((travelThisWeek - travelLastWeek) / travelLastWeek) * 100);
    if (diffPct >= 10) insights.push(`Travel expenses are up ${diffPct}% compared with last week.`);
    else if (diffPct <= -10) insights.push(`Travel expenses are down ${Math.abs(diffPct)}% compared with last week.`);
  } else if (travelThisWeek > 0 && travelLastWeek === 0) {
    insights.push('Travel expenses increased compared with last week.');
  }

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const dayOfMonth = now.getDate();
  const monthlyDailyAverage = Math.round(monthTotal / dayOfMonth);
  if (monthExpenses.length > 0) {
    insights.push(`Your average daily spending this month is ${formatTaka(monthlyDailyAverage)}.`);
  }

  const reactedCount = recentExpenses.filter((e) => e.reactions.length > 0).length;

  return {
    insights,
    wifeFeedback: { reactedCount, totalConsidered: recentExpenses.length },
  };
}
