'use client';

import { useMemo, useState } from 'react';
import { CategoryDTO, ExpenseDTO } from '@/lib/types';
import { cn, startOfMonth, startOfWeek } from '@/lib/utils';
import { ExpenseTimeline } from '@/components/ExpenseTimeline';
import { BottomSheet } from '@/components/BottomSheet';
import { ExpenseForm } from '@/components/ExpenseForm';

type Range = 'all' | 'week' | 'month';

export function ExpensesPageClient({
  initialExpenses,
  categories,
  role,
  monitorUserId,
}: {
  initialExpenses: ExpenseDTO[];
  categories: CategoryDTO[];
  role: 'OWNER' | 'MONITOR';
  monitorUserId?: string;
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [range, setRange] = useState<Range>('all');
  const [categoryKey, setCategoryKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<ExpenseDTO | null>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    const rangeStart = range === 'week' ? startOfWeek(now) : range === 'month' ? startOfMonth(now) : null;
    return expenses.filter((e) => {
      if (rangeStart && new Date(e.occurredAt) < rangeStart) return false;
      if (categoryKey && e.category.key !== categoryKey) return false;
      return true;
    });
  }, [expenses, range, categoryKey]);

  function handleSaved(expense: ExpenseDTO) {
    setExpenses((prev) => {
      const without = prev.filter((e) => e.id !== expense.id);
      return [expense, ...without].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    });
    setEditing(null);
  }

  function handleDeleted() {
    setExpenses((prev) => prev.filter((e) => e.id !== editing?.id));
    setEditing(null);
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl text-ink">Expenses</h1>
        <p className="text-sm text-muted">{role === 'OWNER' ? 'Your full spending trail' : "Dip's full spending trail"}</p>
      </header>

      <div className="space-y-2">
        <div className="flex gap-2">
          {(['all', 'week', 'month'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-pill px-4 py-1.5 text-sm font-medium transition',
                range === r ? 'bg-brand text-white' : 'bg-card text-muted border border-line'
              )}
            >
              {r === 'all' ? 'All time' : r === 'week' ? 'This week' : 'This month'}
            </button>
          ))}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
          <button
            onClick={() => setCategoryKey(null)}
            className={cn(
              'shrink-0 rounded-pill border px-3 py-1.5 text-xs font-medium transition',
              categoryKey === null ? 'border-brand bg-brand-tint text-brand-dark' : 'border-line text-muted'
            )}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryKey(c.key === categoryKey ? null : c.key)}
              className={cn(
                'shrink-0 rounded-pill border px-3 py-1.5 text-xs font-medium transition',
                categoryKey === c.key ? 'border-brand bg-brand-tint text-brand-dark' : 'border-line text-muted'
              )}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      <ExpenseTimeline
        expenses={filtered}
        role={role}
        monitorUserId={monitorUserId}
        onSelectExpense={setEditing}
        emptyTitle="Nothing here"
        emptyBody="Try a different filter, or check back after the next expense is logged."
      />

      {role === 'OWNER' && (
        <BottomSheet open={!!editing} onClose={() => setEditing(null)} title="Edit expense">
          {editing && (
            <ExpenseForm
              categories={categories}
              initial={editing}
              onSaved={handleSaved}
              onCancel={() => setEditing(null)}
              onDelete={handleDeleted}
            />
          )}
        </BottomSheet>
      )}
    </div>
  );
}
