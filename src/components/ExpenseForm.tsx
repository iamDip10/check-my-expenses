'use client';

import { useMemo, useState } from 'react';
import { CategoryDTO, ExpenseDTO } from '@/lib/types';
import { PAYMENT_METHODS, TRANSPORT_TYPES } from '@/lib/categories';
import { cn } from '@/lib/utils';

type Props = {
  categories: CategoryDTO[];
  initial?: ExpenseDTO;
  onSaved: (expense: ExpenseDTO) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

export function ExpenseForm({ categories, initial, onSaved, onCancel, onDelete }: Props) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [occurredAt, setOccurredAt] = useState(
    toLocalInputValue(initial ? new Date(initial.occurredAt) : new Date())
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(initial?.paymentMethod ?? 'OTHER');
  const [transportType, setTransportType] = useState(initial?.transportType ?? '');
  const [travelFrom, setTravelFrom] = useState(initial?.travelFrom ?? '');
  const [travelTo, setTravelTo] = useState(initial?.travelTo ?? '');
  const [showTravelFields, setShowTravelFields] = useState(Boolean(initial?.travelFrom || initial?.travelTo));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const selectedCategory = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId]);
  const isTravel = selectedCategory?.key === 'travel';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter an amount.');
      return;
    }
    if (!categoryId) {
      setError('Please choose a category.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        amount: Math.round(parsedAmount),
        categoryId,
        description: description.trim() || null,
        occurredAt: new Date(occurredAt).toISOString(),
        paymentMethod,
        travelFrom: isTravel ? travelFrom.trim() || null : null,
        travelTo: isTravel ? travelTo.trim() || null : null,
        transportType: isTravel ? transportType || null : null,
      };

      const res = await fetch(initial ? `/api/expenses/${initial.id}` : '/api/expenses', {
        method: initial ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Couldn't save this expense.");
      }

      const data = await res.json();
      onSaved(data.expense);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${initial.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      onDelete?.();
    } catch {
      setError("Couldn't delete this expense. Try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="amount" className="mb-2 block text-sm font-medium text-muted">
          Amount
        </label>
        <div className="flex items-center rounded-2xl border border-line bg-paper/50 px-4 py-3 focus-within:border-brand focus-within:bg-white">
          <span className="mr-1 font-display text-3xl text-ink">৳</span>
          <input
            id="amount"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            className="w-full bg-transparent font-display text-3xl text-ink outline-none tabular"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted">Category</p>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const active = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-center transition',
                  active ? 'border-brand bg-brand-tint' : 'border-line bg-paper/40 hover:bg-paper'
                )}
              >
                <span className="text-xl" aria-hidden>
                  {cat.icon}
                </span>
                <span className="text-[11px] font-medium leading-tight text-ink">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-muted">
          Description <span className="text-muted/70">(optional)</span>
        </label>
        <input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Lunch, Uber to office, Groceries…"
          className="w-full rounded-2xl border border-line bg-paper/50 px-4 py-3 text-ink outline-none transition focus:border-brand focus:bg-white"
        />
      </div>

      {isTravel && (
        <div className="rounded-2xl border border-line bg-paper/40 p-3">
          <button
            type="button"
            onClick={() => setShowTravelFields((v) => !v)}
            className="text-sm font-medium text-brand-dark"
          >
            {showTravelFields ? 'Hide trip details' : '+ Add trip details (optional)'}
          </button>
          {showTravelFields && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={travelFrom}
                  onChange={(e) => setTravelFrom(e.target.value)}
                  placeholder="From"
                  className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  value={travelTo}
                  onChange={(e) => setTravelTo(e.target.value)}
                  placeholder="To"
                  className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRANSPORT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTransportType(t === transportType ? '' : t)}
                    className={cn(
                      'rounded-pill border px-3 py-1.5 text-xs font-medium transition',
                      transportType === t ? 'border-brand bg-brand-tint text-brand-dark' : 'border-line text-muted'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="occurredAt" className="mb-2 block text-sm font-medium text-muted">
            Date &amp; time
          </label>
          <input
            id="occurredAt"
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper/50 px-3 py-3 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          />
        </div>
        <div>
          <label htmlFor="paymentMethod" className="mb-2 block text-sm font-medium text-muted">
            Payment
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper/50 px-3 py-3 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          >
            {PAYMENT_METHODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3 pt-1">
        {initial && onDelete && (
          <button
            type="button"
            onClick={() => (confirmingDelete ? handleDelete() : setConfirmingDelete(true))}
            disabled={saving}
            className={cn(
              'rounded-2xl px-4 py-3.5 text-sm font-medium transition',
              confirmingDelete ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
            )}
          >
            {confirmingDelete ? 'Tap again to confirm' : 'Delete'}
          </button>
        )}
        <button type="button" onClick={onCancel} className="rounded-2xl px-4 py-3.5 text-sm font-medium text-muted">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="ml-auto flex-1 rounded-2xl bg-brand py-3.5 text-base font-medium text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Save expense'}
        </button>
      </div>
    </form>
  );
}
