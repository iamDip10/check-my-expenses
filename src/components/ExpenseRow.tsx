'use client';

import { ExpenseDTO } from '@/lib/types';
import { formatTaka, formatTime } from '@/lib/utils';
import { CategoryBadge } from './CategoryBadge';
import { ReactionPicker } from './ReactionPicker';

export function ExpenseRow({
  expense,
  role,
  monitorUserId,
  onClick,
}: {
  expense: ExpenseDTO;
  role: 'OWNER' | 'MONITOR';
  monitorUserId?: string;
  onClick?: () => void;
}) {
  const myReaction = role === 'MONITOR' ? expense.reactions.find((r) => r.userId === monitorUserId) : undefined;
  const anyReaction = expense.reactions[0];

  return (
    <div className="animate-rise-in rounded-2xl border border-line bg-card p-3.5 shadow-soft">
      <button
        type="button"
        onClick={onClick}
        disabled={role !== 'OWNER'}
        className="flex w-full items-center gap-3 text-left"
      >
        <CategoryBadge category={expense.category} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {expense.description || expense.category.label}
          </p>
          <p className="text-xs text-muted">
            {formatTime(new Date(expense.occurredAt))}
            {expense.description ? ` · ${expense.category.label}` : ''}
          </p>
        </div>
        <p className="shrink-0 font-display text-lg tabular text-ink">{formatTaka(expense.amount)}</p>
      </button>

      {role === 'MONITOR' && (
        <div className="mt-3 border-t border-line pt-3">
          <ReactionPicker expenseId={expense.id} currentEmoji={myReaction?.emoji ?? null} compact />
        </div>
      )}

      {role === 'OWNER' && anyReaction && (
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-line pt-2.5 text-xs text-muted">
          <span className="text-base leading-none">{anyReaction.emoji}</span>
          Wife reacted
        </div>
      )}
    </div>
  );
}
