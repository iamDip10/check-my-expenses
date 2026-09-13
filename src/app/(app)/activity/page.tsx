import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOwnerId } from '@/lib/session';
import { formatDay, formatTaka, formatTime } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;
  const ownerId = await getOwnerId();

  const reactions = await prisma.reaction.findMany({
    where: { userId: user.id, expense: { userId: ownerId } },
    include: { expense: { include: { category: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 60,
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl text-ink">Activity</h1>
        <p className="text-sm text-muted">Every expense you've reacted to</p>
      </header>

      {reactions.length === 0 ? (
        <EmptyState title="No reactions yet" body="Tap an emoji on any expense to leave your mark." />
      ) : (
        <div className="space-y-2.5">
          {reactions.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-soft">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper text-2xl" aria-hidden>
                {r.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {r.expense.category.icon} {r.expense.description || r.expense.category.label}
                </p>
                <p className="text-xs text-muted">
                  {formatDay(new Date(r.expense.occurredAt))} · {formatTime(new Date(r.expense.occurredAt))}
                </p>
              </div>
              <p className="shrink-0 font-display text-base tabular text-ink">{formatTaka(r.expense.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
