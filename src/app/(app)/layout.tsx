import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { BottomNav } from '@/components/nav/BottomNav';
import { Sidebar } from '@/components/nav/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const role = session.user.role;
  const name = session.user.name ?? (role === 'OWNER' ? 'Dip' : 'there');

  return (
    <div className="min-h-dvh bg-paper lg:flex">
      <Sidebar role={role} name={name} />
      <div className="flex-1 lg:min-w-0">
        <main className="mx-auto max-w-2xl px-4 pb-28 pt-6 lg:max-w-3xl lg:px-10 lg:pb-10 lg:pt-10">{children}</main>
      </div>
      <BottomNav role={role} />
    </div>
  );
}
