'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("That email or password didn't work. Try again.");
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm animate-rise-in">
        <div className="mb-10 text-center">
          <p className="mb-2 text-3xl">📔</p>
          <h1 className="font-display text-3xl italic text-ink">Our Ledger</h1>
          <p className="mt-2 text-sm text-muted">A quiet place to track the everyday.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card border border-line bg-card p-6 shadow-soft">
          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper/40 px-4 py-3 text-base text-ink outline-none transition focus:border-brand focus:bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper/40 px-4 py-3 text-base text-ink outline-none transition focus:border-brand focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-3.5 text-base font-medium text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">Private and just for the two of us.</p>
      </div>
    </main>
  );
}
