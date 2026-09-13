'use client';

import { useState, useTransition } from 'react';
import { cn, REACTION_LABELS, REACTION_MEANINGS, REACTION_SET } from '@/lib/utils';

export function ReactionPicker({
  expenseId,
  currentEmoji,
  compact = false,
}: {
  expenseId: string;
  currentEmoji: string | null;
  compact?: boolean;
}) {
  const [emoji, setEmoji] = useState(currentEmoji);
  const [justPicked, setJustPicked] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function react(next: string) {
    const previous = emoji;
    setEmoji(next);
    setJustPicked(next);
    setTimeout(() => setJustPicked(null), 300);

    startTransition(async () => {
      try {
        const res = await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expenseId, emoji: next }),
        });
        if (!res.ok) throw new Error();
      } catch {
        setEmoji(previous);
      }
    });
  }

  const visibleSet = compact ? REACTION_SET.slice(0, 5) : REACTION_SET;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleSet.map((e) => {
        const active = emoji === e;
        return (
          <button
            key={e}
            type="button"
            title={REACTION_MEANINGS[e]}
            aria-label={REACTION_LABELS[e]}
            aria-pressed={active}
            onClick={() => react(e)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-lg transition',
              active ? 'bg-brand-tint ring-2 ring-brand' : 'bg-paper hover:bg-line/60',
              justPicked === e && 'animate-pop-in'
            )}
          >
            {e}
          </button>
        );
      })}
    </div>
  );
}
