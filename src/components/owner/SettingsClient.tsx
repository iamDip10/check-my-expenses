'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { CategoryDTO, QuickActionDTO } from '@/lib/types';
import { formatTaka } from '@/lib/utils';

export function SettingsClient({
  categories: initialCategories,
  quickActions: initialQuickActions,
}: {
  categories: CategoryDTO[];
  quickActions: QuickActionDTO[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [quickActions, setQuickActions] = useState(initialQuickActions);

  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('✨');
  const [savingCategory, setSavingCategory] = useState(false);

  const [qaLabel, setQaLabel] = useState('');
  const [qaAmount, setQaAmount] = useState('');
  const [qaCategoryId, setQaCategoryId] = useState(categories[0]?.id ?? '');
  const [savingQa, setSavingQa] = useState(false);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryLabel.trim()) return;
    setSavingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newCategoryLabel.trim(), icon: newCategoryIcon || '📦' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => [...prev, data.category]);
        setNewCategoryLabel('');
        setNewCategoryIcon('✨');
      }
    } finally {
      setSavingCategory(false);
    }
  }

  async function addQuickAction(e: React.FormEvent) {
    e.preventDefault();
    const amount = Math.round(Number(qaAmount));
    if (!qaLabel.trim() || !amount || !qaCategoryId) return;
    setSavingQa(true);
    try {
      const res = await fetch('/api/quick-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: qaLabel.trim(), amount, categoryId: qaCategoryId }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuickActions((prev) => [...prev, data.quickAction]);
        setQaLabel('');
        setQaAmount('');
      }
    } finally {
      setSavingQa(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl text-ink">Settings</h1>
        <p className="text-sm text-muted">Customize categories and quick actions</p>
      </header>

      <section className="rounded-card border border-line bg-card p-5 shadow-soft">
        <p className="mb-3 text-sm font-medium text-muted">Categories</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5 rounded-pill bg-paper px-3 py-1.5 text-sm text-ink">
              {c.icon} {c.label}
            </span>
          ))}
        </div>
        <form onSubmit={addCategory} className="flex gap-2">
          <input
            value={newCategoryIcon}
            onChange={(e) => setNewCategoryIcon(e.target.value)}
            maxLength={4}
            className="w-14 rounded-2xl border border-line bg-paper/50 px-3 py-2.5 text-center text-lg outline-none focus:border-brand focus:bg-white"
            aria-label="Icon"
          />
          <input
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            placeholder="New category name"
            className="w-full rounded-2xl border border-line bg-paper/50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
          />
          <button
            type="submit"
            disabled={savingCategory}
            className="shrink-0 rounded-2xl bg-brand px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            Add
          </button>
        </form>
      </section>

      <section className="rounded-card border border-line bg-card p-5 shadow-soft">
        <p className="mb-3 text-sm font-medium text-muted">Quick actions</p>
        <div className="mb-4 space-y-2">
          {quickActions.map((qa) => (
            <div key={qa.id} className="flex items-center gap-3 rounded-2xl bg-paper/60 px-3 py-2.5 text-sm">
              <span>{qa.category.icon}</span>
              <span className="flex-1 text-ink">{qa.label}</span>
              <span className="font-medium tabular text-ink">{formatTaka(qa.amount)}</span>
            </div>
          ))}
          {quickActions.length === 0 && <p className="text-sm text-muted">No quick actions yet.</p>}
        </div>
        <form onSubmit={addQuickAction} className="space-y-2">
          <div className="flex gap-2">
            <input
              value={qaLabel}
              onChange={(e) => setQaLabel(e.target.value)}
              placeholder="Label, e.g. Lunch"
              className="w-full rounded-2xl border border-line bg-paper/50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
            />
            <input
              inputMode="decimal"
              value={qaAmount}
              onChange={(e) => setQaAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Amount"
              className="w-28 shrink-0 rounded-2xl border border-line bg-paper/50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={qaCategoryId}
              onChange={(e) => setQaCategoryId(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper/50 px-3 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={savingQa}
              className="shrink-0 rounded-2xl bg-brand px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Add
            </button>
          </div>
        </form>
      </section>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full rounded-2xl border border-line bg-card py-3.5 text-sm font-medium text-muted transition hover:text-ink lg:hidden"
      >
        Sign out
      </button>
    </div>
  );
}
