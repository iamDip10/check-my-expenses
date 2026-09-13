'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryDTO, ExpenseDTO, QuickActionDTO } from '@/lib/types';
import { formatTaka } from '@/lib/utils';
import { BigNumber } from '@/components/BigNumber';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { ExpenseTimeline } from '@/components/ExpenseTimeline';
import { BottomSheet } from '@/components/BottomSheet';
import { ExpenseForm } from '@/components/ExpenseForm';

export function OwnerDashboard({
  initialTodayExpenses,
  categories,
  quickActions,
  ownerName,
}: {
  initialTodayExpenses: ExpenseDTO[];
  categories: CategoryDTO[];
  quickActions: QuickActionDTO[];
  ownerName: string;
}) {
  const [expenses, setExpenses] = useState(initialTodayExpenses);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseDTO | null>(null);
  const [firingId, setFiringId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('add') === '1') setSheetOpen(true);
  }, [searchParams]);

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  function closeSheet() {
    setSheetOpen(false);
    setEditing(null);
    if (searchParams.get('add')) router.replace('/dashboard');
  }

  function handleSaved(expense: ExpenseDTO) {
    setExpenses((prev) => {
      const isToday = new Date(expense.occurredAt).toDateString() === new Date().toDateString();
      const withoutOld = prev.filter((e) => e.id !== expense.id);
      if (!isToday) return withoutOld;
      return [expense, ...withoutOld].sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
    });
    closeSheet();
  }

  function handleDeleted() {
    setExpenses((prev) => prev.filter((e) => e.id !== editing?.id));
    closeSheet();
  }

  async function fireQuickAction(qa: QuickActionDTO) {
    setFiringId(qa.id);
    try {
      const res = await fetch(`/api/quick-actions/${qa.id}/fire`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setExpenses((prev) => [data.expense, ...prev]);
    } catch {
      // silently ignore; user can use the full form instead
    } finally {
      setFiringId(null);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">How did today go, {ownerName}?</p>
          <p className="mt-1 font-display text-4xl text-ink">
            <BigNumber value={total} />
          </p>
          <p className="text-sm text-muted">Spent today</p>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="hidden shrink-0 items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-medium text-white shadow-soft transition active:scale-[0.98] lg:flex"
        >
          + Add expense
        </button>
      </header>

      {quickActions.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 no-scrollbar">
          {quickActions.map((qa) => (
            <button
              key={qa.id}
              onClick={() => fireQuickAction(qa)}
              disabled={firingId === qa.id}
              className="flex shrink-0 items-center gap-2 rounded-pill border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-soft transition active:scale-95 disabled:opacity-50"
            >
              <span aria-hidden>{qa.category.icon}</span>
              {formatTaka(qa.amount)} {qa.label}
              {firingId === qa.id && <span className="ml-1 animate-pulse">…</span>}
            </button>
          ))}
        </div>
      )}

      {expenses.length > 0 && (
        <div className="rounded-card border border-line bg-card p-5 shadow-soft">
          <p className="mb-4 text-sm font-medium text-muted">Today's categories</p>
          <CategoryBreakdown expenses={expenses} />
        </div>
      )}

      <div>
        <p className="mb-2.5 text-sm font-medium text-muted">Today's trail</p>
        <ExpenseTimeline
          expenses={expenses}
          role="OWNER"
          onSelectExpense={setEditing}
          emptyTitle="No expenses today"
          emptyBody="Looks like you've been financially quiet today."
        />
      </div>

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-lift transition active:scale-95 lg:hidden"
        aria-label="Add expense"
      >
        +
      </button>

      <BottomSheet open={sheetOpen || !!editing} onClose={closeSheet} title={editing ? 'Edit expense' : 'Add expense'}>
        <ExpenseForm
          categories={categories}
          initial={editing ?? undefined}
          onSaved={handleSaved}
          onCancel={closeSheet}
          onDelete={editing ? handleDeleted : undefined}
        />
      </BottomSheet>
    </div>
  );
}
