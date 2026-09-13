'use client';

import { useMemo } from 'react';
import { ExpenseDTO } from '@/lib/types';
import { BigNumber } from '@/components/BigNumber';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { ExpenseTimeline } from '@/components/ExpenseTimeline';

export function MonitorDashboard({
  initialTodayExpenses,
  recentExpenses,
  monitorUserId,
  ownerName,
}: {
  initialTodayExpenses: ExpenseDTO[];
  recentExpenses: ExpenseDTO[];
  monitorUserId: string;
  ownerName: string;
}) {
  const total = useMemo(() => initialTodayExpenses.reduce((s, e) => s + e.amount, 0), [initialTodayExpenses]);

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm text-muted">Keeping an eye on things</p>
        <p className="mt-1 font-display text-4xl text-ink">
          <BigNumber value={total} />
        </p>
        <p className="text-sm text-muted">{ownerName}'s spending today</p>
      </header>

      {initialTodayExpenses.length > 0 && (
        <div className="rounded-card border border-line bg-card p-5 shadow-soft">
          <p className="mb-4 text-sm font-medium text-muted">Today's categories</p>
          <CategoryBreakdown expenses={initialTodayExpenses} />
        </div>
      )}

      <div>
        <p className="mb-2.5 text-sm font-medium text-muted">Recent expenses</p>
        <ExpenseTimeline
          expenses={recentExpenses}
          role="MONITOR"
          monitorUserId={monitorUserId}
          emptyTitle="No expenses recorded yet"
          emptyBody="Nothing to monitor today."
        />
      </div>
    </div>
  );
}
