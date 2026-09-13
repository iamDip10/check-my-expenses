import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOwnerId, getSessionUser } from '@/lib/session';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ownerId = await getOwnerId();

  const reactions = await prisma.reaction.findMany({
    where: { expense: { userId: ownerId } },
    include: { expense: { include: { category: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 30,
  });

  const tally = new Map<string, number>();
  for (const r of reactions) {
    tally.set(r.emoji, (tally.get(r.emoji) ?? 0) + 1);
  }

  return NextResponse.json({
    reactions,
    tally: [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([emoji, count]) => ({ emoji, count })),
  });
}
