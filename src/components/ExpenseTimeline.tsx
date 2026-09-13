'use client';

import { ExpenseDTO } from '@/lib/types';
import { formatDay, formatTaka } from '@/lib/utils';
import { ExpenseRow } from './ExpenseRow';
import { EmptyState } from './EmptyState';

export function ExpenseTimeline({
  expenses,
  role,
  monitorUserId,
  onSelectExpense,
  emptyTitle,
  emptyBody,
}: {
  expenses: ExpenseDTO[];
  role: 'OWNER' | 'MONITOR';
  monitorUserId?: string;
  onSelectExpense?: (expense: ExpenseDTO) => void;
  emptyTitle: string;
  emptyBody: string;
}) {
  if (expenses.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  const groups = new Map<string, ExpenseDTO[]>();
  for (const e of expenses) {
    const dayKey = new Date(e.occurredAt).toDateString();
    if (!groups.has(dayKey)) groups.set(dayKey, []);
    groups.get(dayKey)!.push(e);
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([dayKey, dayExpenses]) => {
        const total = dayExpenses.reduce((s, e) => s + e.amount, 0);
        return (
          <section key={dayKey}>
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                {formatDay(new Date(dayKey))}
              </h3>
              <span className="text-xs font-medium text-muted">{formatTaka(total)}</span>
            </div>
            <div className="space-y-2">
              {dayExpenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  role={role}
                  monitorUserId={monitorUserId}
                  onClick={() => onSelectExpense?.(expense)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
