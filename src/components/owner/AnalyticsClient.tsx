'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts';
import { ExpenseDTO } from '@/lib/types';
import { formatShortDay, formatTaka, formatMonth } from '@/lib/utils';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { ExpenseTimeline } from '@/components/ExpenseTimeline';

type Budget = { amount: number } | null;

export function AnalyticsClient({
  weekExpenses,
  monthExpenses,
  budget,
  currentMonthKey,
  insights,
  wifeFeedback,
  reactionTally,
}: {
  weekExpenses: ExpenseDTO[];
  monthExpenses: ExpenseDTO[];
  budget: Budget;
  currentMonthKey: string;
  insights: string[];
  wifeFeedback: { reactedCount: number; totalConsidered: number };
  reactionTally: { emoji: string; count: number }[];
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState(budget?.amount ?? 0);
  const [budgetInput, setBudgetInput] = useState(String(budget?.amount ?? ''));
  const [savingBudget, setSavingBudget] = useState(false);

  const dayTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of weekExpenses) {
      const key = new Date(e.occurredAt).toDateString();
      map.set(key, (map.get(key) ?? 0) + e.amount);
    }
    return [...map.entries()]
      .map(([key, total]) => ({ key, label: formatShortDay(new Date(key)), total }))
      .sort((a, b) => new Date(a.key).getTime() - new Date(b.key).getTime());
  }, [weekExpenses]);

  const selectedDayExpenses = useMemo(
    () => (selectedDay ? weekExpenses.filter((e) => new Date(e.occurredAt).toDateString() === selectedDay) : []),
    [selectedDay, weekExpenses]
  );

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthCount = monthExpenses.length;
  const avgDaily = monthCount ? Math.round(monthTotal / new Date().getDate()) : 0;

  const highestDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExpenses) {
      const key = new Date(e.occurredAt).toDateString();
      map.set(key, (map.get(key) ?? 0) + e.amount);
    }
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0];
  }, [monthExpenses]);

  const topCategory = useMemo(() => {
    const map = new Map<string, { label: string; icon: string; total: number }>();
    for (const e of monthExpenses) {
      const entry = map.get(e.category.key) ?? { label: e.category.label, icon: e.category.icon, total: 0 };
      entry.total += e.amount;
      map.set(e.category.key, entry);
    }
    return [...map.values()].sort((a, b) => b.total - a.total)[0];
  }, [monthExpenses]);

  async function saveBudget(e: React.FormEvent) {
    e.preventDefault();
    const amount = Math.round(Number(budgetInput));
    if (!amount || amount <= 0) return;
    setSavingBudget(true);
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonthKey, amount }),
      });
      if (res.ok) setBudgetAmount(amount);
    } finally {
      setSavingBudget(false);
    }
  }

  const remaining = budgetAmount - monthTotal;
  const pctUsed = budgetAmount > 0 ? Math.min(100, Math.round((monthTotal / budgetAmount) * 100)) : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl text-ink">Analytics</h1>
        <p className="text-sm text-muted">Your spending trail, from the week up to the month</p>
      </header>

      {insights.length > 0 && (
        <section className="grid gap-2.5 sm:grid-cols-2">
          {insights.map((line, i) => (
            <div key={i} className="rounded-2xl border border-line bg-brand-tint/60 px-4 py-3 text-sm text-brand-dark">
              {line}
            </div>
          ))}
        </section>
      )}

      <section className="rounded-card border border-line bg-card p-5 shadow-soft">
        <p className="mb-4 text-sm font-medium text-muted">This week</p>
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={dayTotals} onClick={(s: any) => s?.activeLabel && setSelectedDay(s.activePayload?.[0]?.payload?.key)}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#847A6F' }} />
              <Bar dataKey="total" radius={[8, 8, 8, 8]} fill="#2F5545" maxBarSize={28} isAnimationActive animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-muted">Tap a bar to see that day's expenses</p>
        {selectedDay && (
          <div className="mt-4 border-t border-line pt-4">
            <ExpenseTimeline
              expenses={selectedDayExpenses}
              role="OWNER"
              emptyTitle="Nothing that day"
              emptyBody="No expenses were logged."
            />
          </div>
        )}
      </section>

      <section className="rounded-card border border-line bg-card p-5 shadow-soft">
        <p className="mb-1 text-sm font-medium text-muted">{formatMonth(new Date())}</p>
        <p className="mb-4 font-display text-3xl text-ink">{formatTaka(monthTotal)}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Transactions" value={String(monthCount)} />
          <Stat label="Avg daily" value={formatTaka(avgDaily)} />
          <Stat label="Highest day" value={highestDay ? formatTaka(highestDay[1]) : '—'} />
          <Stat label="Top category" value={topCategory ? `${topCategory.icon} ${topCategory.label}` : '—'} />
        </div>
        {monthExpenses.length > 0 && (
          <div className="mt-5 border-t border-line pt-5">
            <CategoryBreakdown expenses={monthExpenses} />
          </div>
        )}
      </section>

      <section className="rounded-card border border-line bg-card p-5 shadow-soft">
        <p className="mb-3 text-sm font-medium text-muted">Monthly budget</p>
        {budgetAmount > 0 ? (
          <div className="mb-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-display text-2xl text-ink">{formatTaka(remaining)}</span>
              <span className="text-xs text-muted">remaining of {formatTaka(budgetAmount)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-pill bg-paper">
              <div
                className="h-full rounded-pill bg-brand transition-all duration-700"
                style={{ width: `${pctUsed}%`, backgroundColor: pctUsed >= 100 ? '#C0392B' : undefined }}
              />
            </div>
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted">No budget set yet — this is optional.</p>
        )}
        <form onSubmit={saveBudget} className="flex gap-2">
          <input
            inputMode="decimal"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 35000"
            className="w-full rounded-2xl border border-line bg-paper/50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
          />
          <button
            type="submit"
            disabled={savingBudget}
            className="shrink-0 rounded-2xl bg-brand px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {savingBudget ? 'Saving…' : 'Set budget'}
          </button>
        </form>
      </section>

      {reactionTally.length > 0 && (
        <section className="rounded-card border border-line bg-card p-5 shadow-soft">
          <p className="mb-3 text-sm font-medium text-muted">Wife's reactions</p>
          <div className="mb-3 flex flex-wrap gap-3">
            {reactionTally.map((r) => (
              <span key={r.emoji} className="flex items-center gap-1.5 rounded-pill bg-paper px-3 py-1.5 text-sm">
                <span>{r.emoji}</span>
                <span className="font-medium tabular text-ink">{r.count}</span>
              </span>
            ))}
          </div>
          <p className="text-sm text-muted">
            Your wife reacted to {wifeFeedback.reactedCount} of your last {wifeFeedback.totalConsidered} expenses.
          </p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper/60 px-3 py-3">
      <p className="truncate font-display text-base text-ink">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
