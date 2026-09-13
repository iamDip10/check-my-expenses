import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user;
}

/**
 * This app tracks a single spender's (the OWNER's) expenses. Both roles read
 * from that same stream, so every data query resolves "the owner" first,
 * regardless of who is asking. This keeps a single source of truth and means
 * adding more owners later doesn't require rethinking the schema.
 */
export async function getOwnerId() {
  const owner = await prisma.user.findFirst({ where: { role: 'OWNER' }, select: { id: true } });
  if (!owner) throw new Error('No owner account has been set up yet.');
  return owner.id;
}
