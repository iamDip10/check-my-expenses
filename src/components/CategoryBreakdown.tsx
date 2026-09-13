'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { ExpenseDTO } from '@/lib/types';
import { formatTaka } from '@/lib/utils';

export function CategoryBreakdown({ expenses }: { expenses: ExpenseDTO[] }) {
  const totals = new Map<string, { label: string; icon: string; color: string; total: number }>();
  let grandTotal = 0;

  for (const e of expenses) {
    grandTotal += e.amount;
    const entry = totals.get(e.category.key) ?? {
      label: e.category.label,
      icon: e.category.icon,
      color: e.category.color,
      total: 0,
    };
    entry.total += e.amount;
    totals.set(e.category.key, entry);
  }

  const rows = [...totals.values()].sort((a, b) => b.total - a.total);

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={rows}
              dataKey="total"
              nameKey="label"
              innerRadius="65%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive
              animationDuration={600}
            >
              {rows.map((r) => (
                <Cell key={r.label} fill={r.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2">
        {rows.map((r) => {
          const pct = grandTotal ? Math.round((r.total / grandTotal) * 100) : 0;
          return (
            <li key={r.label} className="flex items-center gap-2.5 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="flex-1 truncate text-ink">
                {r.icon} {r.label}
              </span>
              <span className="tabular text-muted">{pct}%</span>
              <span className="w-20 shrink-0 text-right font-medium tabular text-ink">{formatTaka(r.total)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
