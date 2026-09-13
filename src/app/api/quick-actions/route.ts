import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOwnerId, getSessionUser } from '@/lib/session';

const createQuickActionSchema = z.object({
  label: z.string().min(1).max(40),
  amount: z.number().int().positive().max(10_000_000),
  categoryId: z.string().min(1),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ownerId = await getOwnerId();
  const quickActions = await prisma.quickAction.findMany({
    where: { userId: ownerId },
    include: { category: true },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json({ quickActions });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the owner can manage quick actions.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createQuickActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please check the quick action details.' }, { status: 400 });

  const maxOrder = await prisma.quickAction.aggregate({
    where: { userId: user.id },
    _max: { order: true },
  });

  const quickAction = await prisma.quickAction.create({
    data: { ...parsed.data, userId: user.id, order: (maxOrder._max.order ?? 0) + 1 },
    include: { category: true },
  });

  return NextResponse.json({ quickAction }, { status: 201 });
}
