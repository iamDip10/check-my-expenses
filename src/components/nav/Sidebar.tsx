'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const OWNER_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏡' },
  { href: '/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

const MONITOR_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏡' },
  { href: '/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/activity', label: 'Activity', icon: '💬' },
];

export function Sidebar({ role, name }: { role: 'OWNER' | 'MONITOR'; name: string }) {
  const pathname = usePathname();
  const links = role === 'OWNER' ? OWNER_LINKS : MONITOR_LINKS;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-card lg:flex lg:flex-col lg:justify-between lg:px-5 lg:py-8">
      <div>
        <div className="mb-8 px-2">
          <p className="font-display text-xl italic text-ink">📔 Our Ledger</p>
          <p className="mt-1 text-xs text-muted">{role === 'OWNER' ? `Hi, ${name}` : `Watching ${name}'s spending`}</p>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                  active ? 'bg-brand-tint text-brand-dark' : 'text-muted hover:bg-paper hover:text-ink'
                )}
              >
                <span aria-hidden>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mx-2 rounded-2xl px-3 py-2 text-left text-sm text-muted transition hover:bg-paper hover:text-ink"
      >
        Sign out
      </button>
    </aside>
  );
}
