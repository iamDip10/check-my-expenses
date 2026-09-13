'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const OWNER_TABS = [
  { href: '/dashboard', label: 'Home', icon: '🏡' },
  { href: '/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/settings', label: 'More', icon: '⚙️' },
];

const MONITOR_TABS = [
  { href: '/dashboard', label: 'Home', icon: '🏡' },
  { href: '/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/activity', label: 'Activity', icon: '💬' },
];

export function BottomNav({ role }: { role: 'OWNER' | 'MONITOR' }) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = role === 'OWNER' ? OWNER_TABS : MONITOR_TABS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur lg:hidden">
      <div className="relative mx-auto flex max-w-2xl items-center justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-[64px] flex-1 flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[11px] font-medium transition',
                active ? 'text-brand' : 'text-muted'
              )}
            >
              <span className="text-xl leading-none" aria-hidden>
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
        {role === 'OWNER' && (
          <button
            onClick={() => router.push('/dashboard?add=1')}
            aria-label="Add expense"
            className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-lift transition active:scale-95"
          >
            +
          </button>
        )}
      </div>
    </nav>
  );
}
