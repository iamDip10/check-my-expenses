export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-card/60 px-6 py-12 text-center">
      <p className="mb-1 text-2xl">🕊️</p>
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
